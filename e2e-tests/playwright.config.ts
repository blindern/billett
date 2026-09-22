import { defineConfig, devices } from "@playwright/test"
import "dotenv/config"

const baseURL = process.env.BASE_URL || "https://billett.blindernuka.no"

export default defineConfig({
  // Only the @render suite serves a local build. Playwright starts webServer on every run
  // of this config regardless of --grep, and the production monitor and post-deploy jobs
  // share it without ever building the frontend.
  ...(process.env.RENDER_SERVER
    ? {
        webServer: {
          command: "pnpm dlx serve -s ../frontend/dist/billett/browser -l 4200",
          url: "http://localhost:4200",
          reuseExistingServer: !process.env.CI,
        },
      }
    : {}),
  testDir: "src",
  testMatch: "**/*.spec.ts",
  timeout: 120000,
  expect: { timeout: 10000 },
  retries: 3,
  reporter: process.env.CI ? [["list"], ["github"], ["html"]] : [["list"], ["html"]],
  use: {
    baseURL,
  },
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
