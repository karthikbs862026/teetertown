import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

interface WorkerIdentity {
  readonly releaseId: string;
  readonly assetSetHash: string;
  readonly cacheName: string;
}

function releaseIdFromManifest(value: unknown): string {
  if (
    typeof value !== "object" ||
    value === null ||
    !("releaseId" in value) ||
    typeof value.releaseId !== "string"
  ) {
    throw new Error("Invalid release manifest returned to the browser test.");
  }
  return value.releaseId;
}

async function serviceWorkerRequestCount(request: APIRequestContext): Promise<number> {
  const response = await request.get("/__teetertown_test__/state");
  const value: unknown = await response.json();
  if (
    typeof value !== "object" ||
    value === null ||
    !("serviceWorkerRequests" in value) ||
    typeof value.serviceWorkerRequests !== "number"
  ) {
    throw new Error("PWA fixture server returned an invalid worker-request count.");
  }
  return value.serviceWorkerRequests;
}

async function queryWorker(page: Page, which: "controller" | "waiting"): Promise<WorkerIdentity> {
  return page.evaluate(async (target) => {
    const registration = await navigator.serviceWorker.getRegistration();
    const worker =
      target === "controller" ? navigator.serviceWorker.controller : registration?.waiting;
    if (worker === null || worker === undefined) {
      throw new Error(`Missing ${target} service worker.`);
    }
    return new Promise<WorkerIdentity>((resolve, reject) => {
      const channel = new MessageChannel();
      const timeout = window.setTimeout(() => {
        reject(new Error(`Timed out querying ${target} service worker.`));
      }, 5_000);
      channel.port1.onmessage = (event: MessageEvent<unknown>) => {
        window.clearTimeout(timeout);
        const value = event.data;
        if (
          typeof value !== "object" ||
          value === null ||
          !("releaseId" in value) ||
          !("assetSetHash" in value) ||
          !("cacheName" in value) ||
          typeof value.releaseId !== "string" ||
          typeof value.assetSetHash !== "string" ||
          typeof value.cacheName !== "string"
        ) {
          reject(new Error("Invalid worker identity."));
          return;
        }
        resolve({
          releaseId: value.releaseId,
          assetSetHash: value.assetSetHash,
          cacheName: value.cacheName
        });
      };
      worker.postMessage({ type: "TEETERTOWN_QUERY_VERSION" }, [channel.port2]);
    });
  }, which);
}

async function waitForWorkerState(page: Page, expected: "installed" | "redundant"): Promise<void> {
  await page.evaluate(async (expectedState) => {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration === undefined) {
      throw new Error("Missing service-worker registration.");
    }
    await registration.update().catch(() => undefined);
    const worker = registration.installing;
    if (worker === null) {
      if (expectedState === "installed" && registration.waiting !== null) {
        return;
      }
      if (expectedState === "redundant" && registration.waiting === null) {
        return;
      }
      throw new Error(`No installing worker reached ${expectedState}.`);
    }
    if (worker.state === expectedState) {
      return;
    }
    await new Promise<void>((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        reject(new Error(`Worker remained ${worker.state}; expected ${expectedState}.`));
      }, 15_000);
      worker.addEventListener("statechange", () => {
        if (worker.state === expectedState) {
          window.clearTimeout(timeout);
          resolve();
        } else if (worker.state === "redundant" && expectedState !== "redundant") {
          window.clearTimeout(timeout);
          reject(new Error("Worker became redundant before installation."));
        }
      });
    });
  }, expected);
}

test("Rapier WASM stays offline and release updates remain atomic", async ({
  page,
  context,
  request
}) => {
  await request.post("/__teetertown_test__/switch?release=v1");
  await page.goto("/");
  await expect(page.locator("canvas.game-canvas")).toBeVisible();
  await expect(page.locator(".stage")).toHaveAttribute("data-release-id", "pwa-fixture-v1");
  await page.evaluate(() => navigator.serviceWorker.ready);
  expect((await queryWorker(page, "controller")).releaseId).toBe("pwa-fixture-v1");

  await context.setOffline(true);
  await page.reload();
  await expect(page.locator("canvas.game-canvas")).toBeVisible();
  await expect(page.locator(".stage")).toHaveAttribute("data-rapier-bootstrap-hash", "74e1d58f");
  await expect(page.locator(".stage")).toHaveAttribute("data-release-id", "pwa-fixture-v1");

  await context.setOffline(false);
  const requestsBeforeHttpFailure = await serviceWorkerRequestCount(request);
  await request.post("/__teetertown_test__/switch?release=v2&failWasm=1");
  await waitForWorkerState(page, "redundant");
  expect(await serviceWorkerRequestCount(request)).toBeGreaterThan(requestsBeforeHttpFailure);
  expect((await queryWorker(page, "controller")).releaseId).toBe("pwa-fixture-v1");
  expect(await page.evaluate(() => caches.keys())).toHaveLength(1);
  await expect(page.locator("canvas.game-canvas")).toBeVisible();

  const requestsBeforeDigestFailure = await serviceWorkerRequestCount(request);
  await request.post("/__teetertown_test__/switch?release=v2&corruptWasm=1");
  await waitForWorkerState(page, "redundant");
  expect(await serviceWorkerRequestCount(request)).toBeGreaterThan(requestsBeforeDigestFailure);
  expect((await queryWorker(page, "controller")).releaseId).toBe("pwa-fixture-v1");
  expect(await page.evaluate(() => caches.keys())).toHaveLength(1);
  await expect(page.locator("canvas.game-canvas")).toBeVisible();

  await request.post("/__teetertown_test__/switch?release=v2");
  await waitForWorkerState(page, "installed");
  expect((await queryWorker(page, "controller")).releaseId).toBe("pwa-fixture-v1");
  expect((await queryWorker(page, "waiting")).releaseId).toBe("pwa-fixture-v2");
  const activeManifest: unknown = await page.evaluate(async () => {
    const response = await fetch("/asset-manifest.json");
    const value: unknown = await response.json();
    return value;
  });
  expect(releaseIdFromManifest(activeManifest)).toBe("pwa-fixture-v1");

  await page.reload();
  await expect(page.locator("canvas.game-canvas")).toBeVisible({ timeout: 15_000 });
  await expect(page.locator(".stage")).toHaveAttribute("data-release-id", "pwa-fixture-v2");
  expect((await queryWorker(page, "controller")).releaseId).toBe("pwa-fixture-v2");
  const cacheNames = await page.evaluate(() => caches.keys());
  expect(cacheNames).toHaveLength(1);
  expect(cacheNames[0]).toContain("pwa-fixture-v2");

  await context.setOffline(true);
  await page.reload();
  await expect(page.locator("canvas.game-canvas")).toBeVisible();
  await expect(page.locator(".stage")).toHaveAttribute("data-rapier-bootstrap-hash", "74e1d58f");
  await expect(page.locator(".stage")).toHaveAttribute("data-release-id", "pwa-fixture-v2");

  await page.evaluate(async () => {
    const [cacheName] = await caches.keys();
    if (cacheName === undefined) {
      throw new Error("Missing active release cache.");
    }
    const cache = await caches.open(cacheName);
    const manifestResponse = await cache.match("/asset-manifest.json");
    if (manifestResponse === undefined) {
      throw new Error("Missing cached release manifest.");
    }
    const manifest: unknown = await manifestResponse.json();
    if (typeof manifest !== "object" || manifest === null || Array.isArray(manifest)) {
      throw new Error("Cached release manifest was invalid.");
    }
    await cache.put(
      "/asset-manifest.json",
      new Response(JSON.stringify({ ...manifest, releaseId: "mixed-release" }), {
        headers: { "content-type": "application/json" }
      })
    );
  });
  await page.reload();
  await expect(page.locator(".fatal-card")).toContainText("Cached release mismatch");
  await expect(page.locator("canvas.game-canvas")).toHaveCount(0);

  await context.setOffline(false);
  await page.getByRole("button", { name: "Recover cached release" }).click();
  await expect(page.locator("canvas.game-canvas")).toBeVisible({ timeout: 15_000 });
  await expect(page.locator(".stage")).toHaveAttribute("data-release-id", "pwa-fixture-v2");
});
