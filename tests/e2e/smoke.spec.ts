import { expect, test } from "@playwright/test";

test("boots the graybox and pauses fixed simulation time", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Teetertown" })).toBeVisible();
  await expect(page.locator("canvas.game-canvas")).toBeVisible();
  await expect(page.locator(".status-pill")).toContainText("Drag left");

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
  await page.mouse.up();
});

test("lab build exposes the adversarial fixture without a second renderer", async ({ page }) => {
  await page.goto("/");
  await page.locator('select[data-lab="scene"]').selectOption("adversarial-lab");
  await expect(page.locator(".status-pill")).toContainText("Internal risk fixtures");
  await expect(page.locator("canvas.game-canvas")).toHaveCount(1);
  await expect(page.locator(".metrics")).toContainText("11");
});
