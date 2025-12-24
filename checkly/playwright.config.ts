import { defineConfig, devices } from "@playwright/test"
import "dotenv/config"

// This file is used with the Playwright VS Code extension.

export default defineConfig({
  testDir: "src/__checks__",
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], locale: "nb-NO" },
    },
  ],
})
