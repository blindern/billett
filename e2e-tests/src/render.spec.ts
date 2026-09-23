import { expect, test } from "./fixtures"
import { EVENT_TITLE, EVENTGROUP_TITLE, mockApi } from "./render-fixtures"

/**
 * Guards the failure mode the signals migration risks: data arrives but the DOM never
 * updates. Each test asserts both that mocked data reached the page and that the loading
 * state resolved — a stuck spinner passes the plain smoke test.
 *
 * Runs against a locally served build with every API call mocked, so it must be kept out
 * of the production monitor in e2e-tests.yml.
 */
test.describe("render", { tag: "@render" }, () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page)
  })

  test("guest index lists eventgroups", async ({ page }) => {
    await page.goto("/")

    await expect(page.getByRole("link", { name: EVENTGROUP_TITLE })).toBeVisible()
  })

  test("eventgroup page renders and resolves loading", async ({ page }) => {
    await page.goto("/eventgroup/1")

    await expect(page.getByRole("heading", { name: EVENTGROUP_TITLE })).toBeVisible()
    await expect(page.locator("billett-page-loading")).toHaveCount(0)
  })

  test("event page renders and resolves loading", async ({ page }) => {
    await page.goto("/event/1")

    await expect(page.getByText(EVENT_TITLE).first()).toBeVisible()
    await expect(page.locator("billett-page-loading")).toHaveCount(0)
  })

  test("missing eventgroup renders not-found, not a stuck spinner", async ({ page }) => {
    await page.goto("/eventgroup/999")

    await expect(page.getByRole("heading", { name: "Side ikke funnet" })).toBeVisible()
    await expect(page.locator("billett-page-loading")).toHaveCount(0)
  })
})
