import { createHash } from "node:crypto";
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { extname, join, relative, resolve, sep } from "node:path";

interface ReleaseAsset {
  readonly path: string;
  readonly sha256: string;
  readonly bytes: number;
  readonly kind: "html" | "script" | "style" | "wasm" | "manifest" | "asset";
}

const outputDirectory = resolve(process.env.TEETERTOWN_OUT_DIR ?? "dist");
const releaseId = process.env.TEETERTOWN_RELEASE_ID ?? process.env.GITHUB_SHA ?? "local";
if (!/^[a-zA-Z0-9._-]+$/.test(releaseId)) {
  throw new Error("Release identity may contain only letters, numbers, dot, underscore, and dash.");
}

async function filesBelow(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? filesBelow(path) : [path];
    })
  );
  return nested.flat();
}

function sha256(bytes: Uint8Array | string): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function kindFor(path: string): ReleaseAsset["kind"] {
  const extension = extname(path);
  if (extension === ".html") {
    return "html";
  }
  if (extension === ".js") {
    return "script";
  }
  if (extension === ".css") {
    return "style";
  }
  if (extension === ".wasm") {
    return "wasm";
  }
  if (extension === ".webmanifest" || extension === ".json") {
    return "manifest";
  }
  return "asset";
}

const outputStat = await stat(outputDirectory);
if (!outputStat.isDirectory()) {
  throw new Error(`${outputDirectory} is not a build directory.`);
}

const files = (await filesBelow(outputDirectory))
  .filter((path) => !path.endsWith(".map"))
  .filter((path) => !path.endsWith(`${sep}sw.js`))
  .filter((path) => !path.endsWith(`${sep}asset-manifest.json`))
  .sort();
const assets: ReleaseAsset[] = [];
for (const file of files) {
  const bytes = await readFile(file);
  const path = `/${relative(outputDirectory, file).split(sep).join("/")}`;
  assets.push({
    path,
    sha256: sha256(bytes),
    bytes: bytes.byteLength,
    kind: kindFor(path)
  });
}
if (!assets.some(({ kind }) => kind === "script") || !assets.some(({ kind }) => kind === "wasm")) {
  throw new Error("Production release must contain both JavaScript and Rapier WASM.");
}

const assetSetHash = sha256(JSON.stringify(assets));
const manifest = {
  schemaVersion: 2,
  releaseId,
  assetSetHash,
  assets
};
const manifestSource = `${JSON.stringify(manifest, null, 2)}\n`;
await writeFile(join(outputDirectory, "asset-manifest.json"), manifestSource, "utf8");

const cachePrefix = "teetertown-release-";
const cacheName = `${cachePrefix}${releaseId}-${assetSetHash.slice(0, 16)}`;
const indexAsset = assets.find(({ path }) => path === "/index.html");
if (indexAsset === undefined) {
  throw new Error("Production release must contain /index.html.");
}
const precacheAssets = [
  { path: "/", sha256: indexAsset.sha256 },
  ...assets,
  { path: "/asset-manifest.json", sha256: sha256(manifestSource) }
];
const workerSource = `const CACHE_PREFIX = ${JSON.stringify(cachePrefix)};
const RELEASE_ID = ${JSON.stringify(releaseId)};
const ASSET_SET_HASH = ${JSON.stringify(assetSetHash)};
const CACHE_NAME = ${JSON.stringify(cacheName)};
const PRECACHE_ASSETS = ${JSON.stringify(precacheAssets, null, 2)};
const PRECACHE_PATHS = new Set(PRECACHE_ASSETS.map(({ path }) => path));

async function sha256Hex(bytes) {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

async function fetchVerifiedAsset(asset) {
  const request = new Request(asset.path, {
    cache: "reload",
    credentials: "same-origin"
  });
  const response = await fetch(request);
  if (!response.ok) {
    throw new Error(\`Release asset \${asset.path} failed with HTTP \${response.status}.\`);
  }
  const actualHash = await sha256Hex(await response.clone().arrayBuffer());
  if (actualHash !== asset.sha256) {
    throw new Error(\`Release asset \${asset.path} failed SHA-256 verification.\`);
  }
  return { request, response };
}

async function prepareReleaseCache() {
  try {
    const verifiedAssets = await Promise.all(PRECACHE_ASSETS.map(fetchVerifiedAsset));
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(
      verifiedAssets.map(({ request, response }) => cache.put(request, response))
    );
  } catch (error) {
    await caches.delete(CACHE_NAME);
    throw error;
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(prepareReleaseCache());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "TEETERTOWN_QUERY_VERSION") {
    event.ports[0]?.postMessage({
      type: "TEETERTOWN_VERSION",
      releaseId: RELEASE_ID,
      assetSetHash: ASSET_SET_HASH,
      cacheName: CACHE_NAME
    });
    return;
  }
  if (
    event.data?.type === "TEETERTOWN_ACTIVATE_UPDATE" &&
    event.data.expectedReleaseId === RELEASE_ID &&
    event.data.expectedAssetSetHash === ASSET_SET_HASH
  ) {
    event.waitUntil(self.skipWaiting());
  }
});

async function currentReleaseResponse(request) {
  const url = new URL(request.url);
  const cache = await caches.open(CACHE_NAME);
  if (request.mode === "navigate") {
    return (await cache.match("/")) ?? fetch(request);
  }
  if (url.origin === self.location.origin && PRECACHE_PATHS.has(url.pathname)) {
    return (await cache.match(url.pathname)) ?? Response.error();
  }
  return fetch(request);
}

self.addEventListener("fetch", (event) => {
  if (event.request.method === "GET") {
    event.respondWith(currentReleaseResponse(event.request));
  }
});
`;
await writeFile(join(outputDirectory, "sw.js"), workerSource, "utf8");
console.log(
  `Generated verified atomic release ${releaseId}/${assetSetHash.slice(0, 16)} with ${assets.length} assets.`
);
