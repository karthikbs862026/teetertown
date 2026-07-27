import { expect, test } from "@playwright/test";

test("boots the graybox and pauses fixed simulation time", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Teetertown" })).toBeVisible();
  await expect(page.locator("canvas.game-canvas")).toBeVisible();
  await expect(page.locator(".status-pill")).toContainText("Drag left");
  await expect(page.locator(".stage")).toHaveAttribute("data-rapier-bootstrap-hash", "74e1d58f");
  await expect(page.locator(".stage")).toHaveAttribute(
    "data-rapier-runtime-variant",
    "modular-wasm-browser"
  );

  const stepMarker = page.locator(".metrics span").first();
  await expect(stepMarker).toContainText("fixed steps");
  await page.getByRole("button", { name: "Pause" }).click();
  const pausedSteps = await stepMarker.textContent();
  await page.waitForTimeout(350);
  expect(await stepMarker.textContent()).toBe(pausedSteps);
  await expect(page.locator(".status-pill")).toContainText("Paused");
});

test("a sustained left drag produces the constrained golden capture", async ({ page }) => {
  await page.goto("/");
  const canvas = page.locator("canvas.game-canvas");
  await expect(canvas).toBeVisible();
  const bounds = await canvas.boundingBox();
  expect(bounds).not.toBeNull();
  if (bounds === null) {
    return;
  }
  const centerX = bounds.x + bounds.width * 0.5;
  const centerY = bounds.y + bounds.height * 0.5;
  await page.mouse.move(centerX, centerY);
  await page.mouse.down();
  await page.mouse.move(centerX - Math.min(bounds.width, bounds.height) * 0.176, centerY);
  await expect(page.locator(".status-pill")).toContainText("Captured", { timeout: 8_000 });
  await expect(page.locator(".metrics")).toHaveAttribute("data-state-hash", /^[0-9a-f]{8}$/);
  await page.mouse.up();
  await expect(page.locator(".metrics")).toHaveAttribute("data-input-active", "false");
});

test("browser modular WASM reproduces the headless command-from-step-one golden", async ({
  page
}) => {
  await page.goto("/");
  await page.waitForFunction(() => window.__TEETERTOWN_LAB_API__ !== undefined);
  const parity = await page.evaluate(async () => {
    const api = window.__TEETERTOWN_LAB_API__;
    if (api === undefined) {
      throw new Error("Browser parity API was not mounted.");
    }
    return api.runGoldenParity();
  });
  expect(parity).toEqual({
    bootstrapHash: "74e1d58f",
    runtimeVariant: "modular-wasm-browser",
    finalStep: 278,
    finalStateHash: "c965c01f",
    result: { kind: "success", step: 278 }
  });
});

test("restarting a paused fixture resumes from a clean fixed-step clock", async ({ page }) => {
  await page.goto("/");
  const metrics = page.locator(".metrics");
  await page.getByRole("button", { name: "Pause" }).click();
  await expect(page.locator(".status-pill")).toContainText("Paused");
  await page.getByRole("button", { name: "Restart fixture" }).click();
  await expect(page.locator(".status-pill")).toContainText("Drag left");
  await expect
    .poll(async () => Number(await metrics.getAttribute("data-fixed-step")))
    .toBeGreaterThan(0);
});

test("lab build exposes the adversarial fixture without a second renderer", async ({ page }) => {
  await page.goto("/");
  await page.locator('select[data-lab="scene"]').selectOption("adversarial-lab");
  await expect(page.locator(".status-pill")).toContainText("Internal risk fixtures");
  await expect(page.locator("canvas.game-canvas")).toHaveCount(1);
  await expect(page.locator(".metrics")).toContainText("11");
});

test("twenty scene transitions retain one canvas and stable tutorial resources", async ({
  page
}) => {
  await page.goto("/");
  const metrics = page.locator(".metrics");
  await expect(metrics).toHaveAttribute("data-geometries", /\d+/);
  const expectedResources = await metrics.evaluate((element) => ({
    bodies: element.dataset.bodies,
    colliders: element.dataset.colliders,
    joints: element.dataset.joints,
    geometries: element.dataset.geometries,
    materials: element.dataset.materials
  }));

  for (let cycle = 0; cycle < 10; cycle += 1) {
    await page.locator('select[data-lab="scene"]').selectOption("adversarial-lab");
    await expect(page.locator(".status-pill")).toContainText("Internal risk fixtures");
    await page.locator('select[data-lab="scene"]').selectOption("tutorial-graybox");
    await expect(page.locator(".status-pill")).toContainText("Drag left");
  }

  await expect(page.locator("canvas.game-canvas")).toHaveCount(1);
  await expect(metrics).toHaveAttribute("data-bodies", expectedResources.bodies ?? "");
  await expect(metrics).toHaveAttribute("data-colliders", expectedResources.colliders ?? "");
  await expect(metrics).toHaveAttribute("data-joints", expectedResources.joints ?? "");
  await expect(metrics).toHaveAttribute("data-geometries", expectedResources.geometries ?? "");
  await expect(metrics).toHaveAttribute("data-materials", expectedResources.materials ?? "");
});

test("WebGL context loss pauses fixed steps and restores through the original extension", async ({
  page
}) => {
  await page.goto("/");
  await expect(page.locator(".status-pill")).toContainText("Drag left");
  const extension = await page.locator("canvas.game-canvas").evaluateHandle((canvas) => {
    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new Error("Gameplay canvas was not an HTMLCanvasElement.");
    }
    const context = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    return context?.getExtension("WEBGL_lose_context") ?? null;
  });
  const supported = await extension.evaluate((value) => value !== null);
  test.skip(!supported, "WEBGL_lose_context is unavailable in this browser.");

  await extension.evaluate((value) => {
    if (value === null) {
      throw new Error("WEBGL_lose_context disappeared before loss.");
    }
    value.loseContext();
  });
  await expect(page.locator(".status-pill")).toContainText("WebGL context lost");
  const stepAtLoss = await page.locator(".metrics").getAttribute("data-fixed-step");
  await page.waitForTimeout(350);
  expect(await page.locator(".metrics").getAttribute("data-fixed-step")).toBe(stepAtLoss);

  await extension.evaluate((value) => {
    if (value === null) {
      throw new Error("WEBGL_lose_context disappeared before restore.");
    }
    value.restoreContext();
  });
  await expect(page.locator(".status-pill")).toContainText("Drag left");
  await expect(page.locator("canvas.game-canvas")).toHaveCount(1);
});

test("pointer cancellation and lost capture neutralize the active command", async ({ page }) => {
  await page.goto("/");
  const canvas = page.locator("canvas.game-canvas");
  const metrics = page.locator(".metrics");
  const bounds = await canvas.boundingBox();
  expect(bounds).not.toBeNull();
  if (bounds === null) {
    return;
  }
  const centerX = bounds.x + bounds.width * 0.5;
  const centerY = bounds.y + bounds.height * 0.5;

  await page.mouse.move(centerX, centerY);
  await page.mouse.down();
  await page.mouse.move(centerX - 24, centerY);
  await expect(metrics).toHaveAttribute("data-input-active", "true");
  await canvas.evaluate((element) => {
    element.dispatchEvent(
      new PointerEvent("pointercancel", { bubbles: true, pointerId: 1, pointerType: "mouse" })
    );
  });
  await expect(metrics).toHaveAttribute("data-input-active", "false");
  await page.mouse.up();

  await page.mouse.move(centerX, centerY);
  await page.mouse.down();
  await page.mouse.move(centerX - 24, centerY);
  await expect(metrics).toHaveAttribute("data-input-active", "true");
  const released = await canvas.evaluate((element) => {
    if (!element.hasPointerCapture(1)) {
      return false;
    }
    element.releasePointerCapture(1);
    return true;
  });
  expect(released).toBe(true);
  await expect(metrics).toHaveAttribute("data-input-active", "false");
  await page.mouse.up();
});

test("all lab camera variants keep the gameplay canvas available", async ({ page }) => {
  await page.goto("/");
  for (const camera of ["perspective_fixed", "bounded_event", "orthographic_fixed"]) {
    await page.locator('select[data-lab="camera"]').selectOption(camera);
    await expect(page.locator("canvas.game-canvas")).toHaveAttribute("data-camera-model", camera);
    await expect(page.locator(".status-pill")).toContainText("Drag left");
    await expect(page.locator("canvas.game-canvas")).toBeVisible();
    await expect(page.locator("canvas.game-canvas")).toHaveCount(1);
  }
});
