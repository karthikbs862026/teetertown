import { expect, test } from "@playwright/test";

test("desktop graybox is readable with collider overlay", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.startsWith("mobile-"), "Desktop project only.");
  await page.goto("/");
  await expect(page.locator("canvas.game-canvas")).toBeVisible();
  await page.waitForTimeout(500);
  await page.screenshot({
    path: testInfo.outputPath("tutorial-desktop.png"),
    fullPage: true
  });
  const bounds = await page.locator(".stage-wrap").boundingBox();
  expect(bounds?.width).toBeGreaterThan(700);
  expect(bounds?.height).toBeGreaterThan(400);
});

test("phone layout keeps the stage and controls on-screen", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("mobile-"), "Mobile project only.");
  await page.goto("/");
  await expect(page.locator("canvas.game-canvas")).toBeVisible();
  await page.waitForTimeout(500);
  await page.screenshot({
    path: testInfo.outputPath("tutorial-phone.png"),
    fullPage: true
  });
  const stage = await page.locator(".stage-wrap").boundingBox();
  expect(stage?.width).toBeLessThanOrEqual(page.viewportSize()?.width ?? 0);
  await expect(page.locator("canvas.game-canvas")).toHaveAttribute("data-camera-left", "-5.3");
  await expect(page.locator("canvas.game-canvas")).toHaveAttribute("data-camera-right", "5.3");
  await expect(page.getByRole("button", { name: "Restart fixture" })).toBeVisible();
});

test("camera variants and adversarial fixture have reviewable desktop baselines", async ({
  page
}, testInfo) => {
  test.skip(testInfo.project.name.startsWith("mobile-"), "Desktop project only.");
  await page.goto("/");
  for (const [value, fileName] of [
    ["perspective_fixed", "tutorial-perspective.png"],
    ["bounded_event", "tutorial-bounded.png"]
  ] as const) {
    await page.locator('select[data-lab="camera"]').selectOption(value);
    await expect(page.locator("canvas.game-canvas")).toHaveAttribute("data-camera-model", value);
    await expect(page.locator(".status-pill")).toContainText("Drag left");
    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              resolve();
            });
          });
        })
    );
    await page.screenshot({ path: testInfo.outputPath(fileName), fullPage: true });
  }
  await page.locator('select[data-lab="scene"]').selectOption("adversarial-lab");
  await expect(page.locator(".status-pill")).toContainText("Internal risk fixtures");
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            resolve();
          });
        });
      })
  );
  await page.screenshot({
    path: testInfo.outputPath("adversarial-desktop.png"),
    fullPage: true
  });
});
