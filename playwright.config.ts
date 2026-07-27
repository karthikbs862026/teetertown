import { defineConfig, devices } from "@playwright/test";

const chromiumExecutablePath = process.env.TEETERTOWN_CHROMIUM_EXECUTABLE_PATH;
const firefoxHeadful = process.env.TEETERTOWN_FIREFOX_HEADFUL === "1";
const fallbackChromium =
  chromiumExecutablePath === undefined
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
      };

const softwareWebglFirefox = {
  headless: !firefoxHeadful,
  launchOptions: {
    firefoxUserPrefs: {
      "gfx.webrender.all": true,
      "gfx.webrender.software": true,
      "webgl.disabled": false,
      "webgl.force-enabled": true
    }
  }
};

export default defineConfig({
  testDir: ".",
  testMatch: ["tests/e2e/**/*.spec.ts", "tests/visual/**/*.spec.ts"],
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure"
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], ...fallbackChromium }
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"], ...softwareWebglFirefox }
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] }
    },
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 7"], ...fallbackChromium }
    },
    {
      name: "mobile-webkit",
      use: { ...devices["iPhone 13"] }
    }
  ],
  webServer: {
    command: process.env.TEETERTOWN_E2E_SERVER_COMMAND ?? "npm run dev:e2e",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
});
