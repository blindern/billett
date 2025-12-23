import { defineConfig } from "checkly"

// See https://www.checklyhq.com/docs/cli/project-structure/

const config = defineConfig({
  projectName: "UKA Billett",
  logicalId: "uka-billett",
  repoUrl: "https://github.com/blindernuka/billett",
  checks: {
    frequency: 1440, // once per day
    locations: ["eu-central-1"],
    runtimeId: "2025.04",
    checkMatch: "**/__checks__/**/*.check.ts",
    playwrightConfig: {
      timeout: 30000,
      use: {
        viewport: { width: 1280, height: 720 },
        locale: "nb-NO",
      },
    },
    browserChecks: {
      testMatch: "**/__checks__/**/*.spec.ts",
    },
  },
  cli: {
    runLocation: "eu-central-1",
    reporters: ["list"],
  },
})

export default config
