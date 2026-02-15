import { defineConfig, devices } from "@playwright/test"
import "dotenv/config"

export default defineConfig({
  testDir: "src",
  testMatch: "**/*.spec.ts",
  timeout: 120000,
  expect: { timeout: 10000 },
  retries: 3,
  reporter: process.env.CI ? [["list"], ["github"], ["html"]] : [["list"], ["html"]],
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        locale: "nb-NO",
        viewport: { width: 1280, height: 720 },
        video: "retain-on-failure",
        trace: "retain-on-failure",
      },
    },
  ],
})
