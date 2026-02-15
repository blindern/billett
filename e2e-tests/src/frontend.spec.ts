import { test, expect } from "./fixtures"

test(
  "frontend loads and renders",
  { tag: "@frontend" },
  async ({ page }) => {
    const response = (await page.goto("https://billett.blindernuka.no"))!
    expect(response.status()).toBeLessThan(400)

    await page.waitForLoadState("networkidle")
    await expect(page.locator("body")).toBeVisible()
  },
)
