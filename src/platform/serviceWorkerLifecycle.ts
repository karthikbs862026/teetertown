import {
  assertReleaseIdentity,
  parseReleaseManifest,
  type ReleaseManifest
} from "./releaseIdentity";

const CACHE_PREFIX = "teetertown-release-";
const WORKER_REPLY_TIMEOUT_MILLISECONDS = 5_000;

interface WorkerIdentity {
  readonly releaseId: string;
  readonly assetSetHash: string;
  readonly cacheName: string;
}

export type ServiceWorkerPreparation = "unsupported" | "uncontrolled" | "ready" | "reloading";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseWorkerIdentity(value: unknown): WorkerIdentity {
  if (
    !isRecord(value) ||
    value.type !== "TEETERTOWN_VERSION" ||
    typeof value.releaseId !== "string" ||
    typeof value.assetSetHash !== "string" ||
    typeof value.cacheName !== "string"
  ) {
    throw new Error("Service worker returned an invalid release identity.");
  }
  return {
    releaseId: value.releaseId,
    assetSetHash: value.assetSetHash,
    cacheName: value.cacheName
  };
}

async function queryWorkerIdentity(worker: ServiceWorker): Promise<WorkerIdentity> {
  const channel = new MessageChannel();
  try {
    return await new Promise<WorkerIdentity>((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        reject(new Error("Timed out while querying the service-worker release."));
      }, WORKER_REPLY_TIMEOUT_MILLISECONDS);
      channel.port1.onmessage = (event: MessageEvent<unknown>) => {
        window.clearTimeout(timeout);
        try {
          resolve(parseWorkerIdentity(event.data));
        } catch (error: unknown) {
          reject(
            error instanceof Error
              ? error
              : new Error("Service worker returned an unknown identity error.")
          );
        }
      };
      worker.postMessage({ type: "TEETERTOWN_QUERY_VERSION" }, [channel.port2]);
    });
  } finally {
    channel.port1.close();
  }
}

async function activateWaitingWorker(
  registration: ServiceWorkerRegistration
): Promise<"none" | "reloading"> {
  const waiting = registration.waiting;
  if (waiting === null || navigator.serviceWorker.controller === null) {
    return "none";
  }
  const identity = await queryWorkerIdentity(waiting);
  const controllerChanged = new Promise<void>((resolve, reject) => {
    const handleControllerChange = (): void => {
      window.clearTimeout(timeout);
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
      resolve();
    };
    const timeout = window.setTimeout(() => {
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
      reject(new Error("Timed out while activating the compatible service-worker release."));
    }, WORKER_REPLY_TIMEOUT_MILLISECONDS);
    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);
  });
  waiting.postMessage({
    type: "TEETERTOWN_ACTIVATE_UPDATE",
    expectedReleaseId: identity.releaseId,
    expectedAssetSetHash: identity.assetSetHash
  });
  await controllerChanged;
  window.location.reload();
  return "reloading";
}

async function fetchCurrentManifest(): Promise<unknown> {
  const response = await fetch("/asset-manifest.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Release manifest request failed with HTTP ${response.status}.`);
  }
  return response.json();
}

async function assertControllerIdentity(manifest: ReleaseManifest): Promise<void> {
  const controller = navigator.serviceWorker.controller;
  if (controller === null) {
    return;
  }
  const identity = await queryWorkerIdentity(controller);
  if (
    identity.releaseId !== manifest.releaseId ||
    identity.assetSetHash !== manifest.assetSetHash
  ) {
    throw new Error("Active service worker does not match the release manifest.");
  }
}

export async function prepareServiceWorkerRelease(
  expectedReleaseId: string
): Promise<ServiceWorkerPreparation> {
  if (!("serviceWorker" in navigator)) {
    const manifest = parseReleaseManifest(await fetchCurrentManifest());
    assertReleaseIdentity(expectedReleaseId, manifest);
    return "unsupported";
  }

  const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  if ((await activateWaitingWorker(registration)) === "reloading") {
    return "reloading";
  }

  const manifest = parseReleaseManifest(await fetchCurrentManifest());
  assertReleaseIdentity(expectedReleaseId, manifest);
  await assertControllerIdentity(manifest);
  return navigator.serviceWorker.controller === null ? "uncontrolled" : "ready";
}

export async function recoverServiceWorkerRelease(): Promise<void> {
  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.getRegistration("/");
    await registration?.unregister();
  }
  if ("caches" in window) {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter((cacheName) => cacheName.startsWith(CACHE_PREFIX))
        .map((cacheName) => caches.delete(cacheName))
    );
  }
  window.location.reload();
}
