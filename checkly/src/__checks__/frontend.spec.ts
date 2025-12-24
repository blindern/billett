import { expect, test } from "@playwright/test"

test("can load billett.blindernuka.no", async ({ page }) => {
  const response = (await page.goto("https://billett.blindernuka.no"))!

  expect(
    response.status(),
    "should respond with correct status code",
  ).toBeLessThan(400)

  // Wait for Angular to bootstrap and render the page
  await page.waitForLoadState("networkidle")

  // Verify the page has loaded by checking for the main content
  await expect(page.locator("body")).toBeVisible()
})
