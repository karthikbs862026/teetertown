import { defineConfig, devices } from "@playwright/test";

const chromiumExecutablePath = process.env.TEETERTOWN_CHROMIUM_EXECUTABLE_PATH;

export default defineConfig({
  testDir: "tests/e2e",
  testMatch: "pwa.spec.ts",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: [
    ["list"],
    [
      "html",
      {
        open: "never",
        outputFolder: process.env.TEETERTOWN_PLAYWRIGHT_REPORT_DIR ?? "playwright-report"
      }
    ]
  ],
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://127.0.0.1:4174",
    serviceWorkers: "allow",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    ...(chromiumExecutablePath === undefined
      ? {}
      : {
          launchOptions: {
            executablePath: chromiumExecutablePath,
            args: [
              "--no-sandbox",
              "--disable-setuid-sandbox",
              "--disable-dev-shm-usage",
              "--ignore-gpu-blocklist",
              "--in-process-gpu",
              "--use-gl=angle",
              "--use-angle=swiftshader",
              "--enable-unsafe-swiftshader"
            ]
          }
        })
  },
  webServer: {
    command: "npm run serve:pwa-fixtures",
    url: "http://127.0.0.1:4174/__teetertown_test__/state",
    reuseExistingServer: false,
    timeout: 120_000
  }
});
