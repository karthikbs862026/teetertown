import { expect, test } from "@playwright/test";

test("desktop graybox is readable with collider overlay", async ({ page }, testInfo) => {
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
  await expect(page.getByRole("button", { name: "Restart fixture" })).toBeVisible();
});
