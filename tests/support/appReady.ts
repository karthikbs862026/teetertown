import { expect, type Page } from "@playwright/test";

export async function gotoReadyGraybox(page: Page): Promise<void> {
  await page.goto("/");
  await expect(page.locator("canvas.game-canvas, .fatal-card").first()).toBeVisible({
    timeout: 10_000
  });

  const fatal = page.locator(".fatal-card");
  if ((await fatal.count()) > 0) {
    throw new Error(`Teetertown boot failure: ${await fatal.innerText()}`);
  }

  await expect(page.locator("canvas.game-canvas")).toBeVisible();
}
