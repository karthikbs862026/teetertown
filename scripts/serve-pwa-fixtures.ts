import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";

const fixtureRoot = resolve(".pwa-fixtures");
const port = 4174;
let activeRelease: "v1" | "v2" = "v1";
let failWasm = false;
let corruptWasm = false;
let serviceWorkerRequests = 0;

const contentTypes: Readonly<Record<string, string>> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".wasm": "application/wasm",
  ".webmanifest": "application/manifest+json; charset=utf-8"
};

function sendJson(response: ServerResponse, status: number, value: unknown): void {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  response.end(JSON.stringify(value));
}

async function serveRequest(request: IncomingMessage, response: ServerResponse): Promise<void> {
  const url = new URL(request.url ?? "/", `http://127.0.0.1:${port}`);
  if (request.method === "POST" && url.pathname === "/__teetertown_test__/switch") {
    const release = url.searchParams.get("release");
    if (release !== "v1" && release !== "v2") {
      sendJson(response, 400, { error: "release must be v1 or v2" });
      return;
    }
    activeRelease = release;
    failWasm = url.searchParams.get("failWasm") === "1";
    corruptWasm = url.searchParams.get("corruptWasm") === "1";
    sendJson(response, 200, {
      activeRelease,
      failWasm,
      corruptWasm,
      serviceWorkerRequests
    });
    return;
  }
  if (url.pathname === "/__teetertown_test__/state") {
    sendJson(response, 200, {
      activeRelease,
      failWasm,
      corruptWasm,
      serviceWorkerRequests
    });
    return;
  }

  const releaseRoot = resolve(fixtureRoot, activeRelease);
  const requestPath = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const filePath = resolve(releaseRoot, `.${requestPath}`);
  if (filePath !== releaseRoot && !filePath.startsWith(`${releaseRoot}${sep}`)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }
  if (filePath.endsWith("sw.js")) {
    serviceWorkerRequests += 1;
  }
  if (failWasm && filePath.endsWith(".wasm")) {
    response.writeHead(503, { "cache-control": "no-store" });
    response.end("Injected WASM download failure");
    return;
  }
  if (corruptWasm && filePath.endsWith(".wasm")) {
    response.writeHead(200, {
      "content-type": "application/wasm",
      "cache-control": "no-store"
    });
    response.end("corrupted wasm fixture");
    return;
  }
  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) {
      throw new Error("Not a file.");
    }
    const bytes = await readFile(filePath);
    response.writeHead(200, {
      "content-type": contentTypes[extname(filePath)] ?? "application/octet-stream",
      "cache-control": "no-store",
      ...(filePath.endsWith("sw.js") ? { "service-worker-allowed": "/" } : {})
    });
    response.end(bytes);
  } catch {
    response.writeHead(404, { "cache-control": "no-store" });
    response.end("Not found");
  }
}

const server = createServer((request, response) => {
  void serveRequest(request, response).catch((error: unknown) => {
    response.writeHead(500, { "cache-control": "no-store" });
    response.end(error instanceof Error ? error.message : "Unexpected fixture-server error.");
  });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`PWA fixture server listening at http://127.0.0.1:${port}`);
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    server.close(() => {
      process.exit(0);
    });
  });
}
