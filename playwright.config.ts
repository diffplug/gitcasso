// playwright.config.ts
import { defineConfig } from "@playwright/test"

export default defineConfig({
  reporter: [["html", { open: "never" }]],
  testDir: "tests/e2e",
  use: {
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "retain-on-failure",
  },
})
