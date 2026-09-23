import type { Page } from "@playwright/test"
import { expect, test } from "./fixtures"
import {
  EVENT_TITLE,
  EVENTGROUP_TITLE,
  mockApi,
  ORDER_TEXT_ID,
  PAYMENTGROUP_TITLE,
} from "./render-fixtures"

/**
 * Guards the failure mode the signals migration risks: data arrives but the DOM never
 * updates. Each test asserts both that mocked data reached the page and that the loading
 * state resolved — a stuck spinner passes the plain smoke test.
 *
 * Runs against a locally served build with every API call mocked, so it must be kept out
 * of the production monitor in e2e-tests.yml.
 */

const expectLoaded = (page: Page) =>
  expect(page.locator("billett-page-loading")).toHaveCount(0)

test.describe("render", { tag: "@render" }, () => {
  let pageErrors: Error[]

  test.beforeEach(({ page }) => {
    pageErrors = []
    page.on("pageerror", (error) => pageErrors.push(error))
  })

  test.afterEach(() => {
    expect(pageErrors).toEqual([])
  })

  test.describe("guest", () => {
    test.beforeEach(async ({ page }) => {
      await mockApi(page)
    })

    test("index lists eventgroups", async ({ page }) => {
      await page.goto("/")

      await expect(page.getByRole("link", { name: EVENTGROUP_TITLE })).toBeVisible()
    })

    test("eventgroup page renders and resolves loading", async ({ page }) => {
      await page.goto("/eventgroup/1")

      await expect(page.getByRole("heading", { name: EVENTGROUP_TITLE })).toBeVisible()
      await expect(page).toHaveTitle(EVENTGROUP_TITLE)
      await expectLoaded(page)
    })

    test("eventgroup filter without matches redirects to full list", async ({ page }) => {
      await page.goto("/eventgroup/1/nomatch")

      await expect(page).toHaveURL(/\/eventgroup\/1$/)
      await expect(page.getByRole("link", { name: EVENT_TITLE })).toBeVisible()
    })

    test("event page renders and resolves loading", async ({ page }) => {
      await page.goto("/event/1")

      await expect(page.getByText(EVENT_TITLE).first()).toBeVisible()
      await expect(page.getByText("Beskrivelse", { exact: true })).toBeVisible()
      await expectLoaded(page)
    })

    test("event purchase reaches receipt", async ({ page }) => {
      await page.goto("/event/1")
      await page.locator(".ticketgroup button:has(.glyphicon-plus)").click()

      await expect(page.locator(".ticketgroup .value")).toHaveText("1")
      await expect(page.getByText("Totalt å betale")).toBeVisible()

      await page.getByRole("button", { name: "Overstyr betaling" }).click()

      await expect(page).toHaveURL(/\/order\/complete$/)
      await expect(page.getByText(ORDER_TEXT_ID)).toBeVisible()
    })

    test("missing eventgroup renders not-found, not a stuck spinner", async ({ page }) => {
      await page.goto("/eventgroup/999")

      await expect(page.getByRole("heading", { name: "Side ikke funnet" })).toBeVisible()
      await expectLoaded(page)
    })

    test("order receipt renders", async ({ page }) => {
      await page.goto("/order/complete")

      await expect(page.getByText(ORDER_TEXT_ID)).toBeVisible()
    })
  })

  test.describe("admin", () => {
    test.beforeEach(async ({ page }) => {
      await mockApi(page, { admin: true })
    })

    for (const [path, heading] of [
      ["/a", "Administrasjon"],
      ["/a/eventgroup/1", EVENTGROUP_TITLE],
      ["/a/event/1", EVENT_TITLE],
      ["/a/eventgroup/1/edit", EVENTGROUP_TITLE],
      ["/a/eventgroup/1/new_event", "Nytt arrangement"],
      ["/a/eventgroup/1/new_daytheme", `Ny temadag for ${EVENTGROUP_TITLE}`],
      ["/a/event/1/ticketgroup/new", "Ny billettgruppe"],
    ]) {
      test(`${path} renders`, async ({ page }) => {
        await page.goto(path)

        await expect(page.getByRole("heading", { name: heading })).toBeVisible()
        await expectLoaded(page)
      })
    }

    test("sold tickets stats renders", async ({ page }) => {
      await page.goto("/a/eventgroup/1/sold_tickets_stats")

      await expect(page.getByRole("cell", { name: EVENT_TITLE })).toBeVisible()
      await expectLoaded(page)
    })

    test("ticketgroup renders", async ({ page }) => {
      await page.goto("/a/event/1/ticketgroup/1")

      await expect(page.getByRole("heading", { name: EVENT_TITLE })).toBeVisible()
      await expect(page.getByRole("heading", { name: EVENT_TITLE })).toContainText(
        "Rediger billettgruppe",
      )
      await expectLoaded(page)
    })

    test("order renders", async ({ page }) => {
      await page.goto("/a/order/1")

      await expect(page.getByRole("heading", { name: `Ordre: ${ORDER_TEXT_ID}` })).toBeVisible()
      await expectLoaded(page)
    })

    test("order edit aborts without changes and saves", async ({ page }) => {
      await page.goto("/a/order/1")

      await page.getByRole("button", { name: "Rediger" }).click()
      await page.locator("#name").fill("Endret")
      await page.getByRole("button", { name: "Avbryt" }).click()
      await expect(page.getByText("Ola Render").first()).toBeVisible()
      await expect(page.getByText("Endret")).toHaveCount(0)

      await page.getByRole("button", { name: "Rediger" }).click()
      await page.getByRole("button", { name: "Oppdater" }).click()
      await expect(page.locator("#name")).toBeHidden()
    })

    test("order payment modal selects paymentgroup", async ({ page }) => {
      await page.goto("/a/order/1")
      await page.getByRole("button", { name: "Ny transaksjon" }).click()

      const select = page.locator("select[name=selectedPaymentgroupId]")
      await expect(select.getByRole("option", { name: PAYMENTGROUP_TITLE })).toHaveCount(1)
      await select.selectOption({ index: 1 })
      await expect(select.getByRole("option", { name: "Velg ..." })).toHaveCount(0)
    })

    test("order add tickets modal counts and submits", async ({ page }) => {
      await page.goto("/a/order/1")
      await page.getByRole("button", { name: "Tilorde nye billetter" }).click()

      const heading = page.getByRole("heading", { name: "Tilordne billetter til ordre" })
      await expect(heading).toBeVisible()
      await page.locator("tr:has-text('Ordinær') button:has(.glyphicon-plus)").click()
      await expect(page.locator(".modal-body dd").first()).toHaveText("1")

      await page.getByRole("button", { name: "Legg til billetter" }).click()
      await expect(heading).toBeHidden()
    })

    test("order print modal resolves printers", async ({ page }) => {
      await page.goto("/a/order/1")
      await page.getByRole("button", { name: "Skriv ut billetter" }).click()

      await expect(page.getByText("Ingen skrivere er tilgjengelig")).toBeVisible()
    })

    test("event edit form renders", async ({ page }) => {
      await page.goto("/a/event/1/edit")

      await expect(page.locator("#title")).toHaveValue(EVENT_TITLE)
      await expectLoaded(page)
    })

    test("event checkin renders tickets", async ({ page }) => {
      await page.goto("/a/event/1/checkin")

      await expect(page.getByRole("heading", { name: EVENT_TITLE })).toBeVisible()
      await expect(page.getByRole("link", { name: ORDER_TEXT_ID })).toBeVisible()
      await expectLoaded(page)
    })

    test("paymentgroup renders", async ({ page }) => {
      await page.goto("/a/paymentgroup/1")

      await expect(
        page.getByRole("heading", { name: `Oppgjør: ${PAYMENTGROUP_TITLE}` }),
      ).toBeVisible()
      await expectLoaded(page)
    })

    test("paymentgroup toggles details and saves edit", async ({ page }) => {
      await page.goto("/a/paymentgroup/1")

      await page.getByRole("button", { name: "Vis detaljer" }).click()
      await expect(page.getByRole("button", { name: "Skjul detaljer" })).toBeVisible()

      await page.getByRole("button", { name: "Rediger" }).click()
      await expect(page.locator("#title")).toHaveValue(PAYMENTGROUP_TITLE)
      await page.getByRole("button", { name: "Oppdater" }).click()
      await expect(page.locator("#title")).toBeHidden()
    })

    test("paymentgroup list renders", async ({ page }) => {
      await page.goto("/a/eventgroup/1/paymentgroups")

      await expect(page.getByRole("link", { name: PAYMENTGROUP_TITLE })).toBeVisible()
      await expectLoaded(page)
    })
  })
})
