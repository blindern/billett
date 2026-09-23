import type { Page, Route } from "@playwright/test"

// Distinctive strings so assertions key on mocked data, not on UI copy.
export const EVENTGROUP_TITLE = "Testgruppe RENDER"
export const EVENT_TITLE = "Testarrangement RENDER"

const json = (route: Route, body: unknown) =>
  route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify(body),
  })

const anonymousAuth = {
  logged_in: false,
  user_roles: [],
  user: null,
  is_admin: false,
  is_dev: false,
  is_vipps_test: false,
  csrf_token: "render-test-csrf",
}

const eventgroup = { id: 1, title: EVENTGROUP_TITLE }

const event = {
  id: 1,
  alias: null,
  is_published: true,
  // Fixed timestamp so the rendered date never depends on the clock.
  time_start: 1790000000,
  time_end: null,
  title: EVENT_TITLE,
  location: "Teststed",
  ticket_info: null,
  selling_text: null,
  category: null,
  max_each_person: 10,
  description: "Beskrivelse",
  description_short: "Kort beskrivelse",
  link: null,
  age_restriction: null,
  web_selling_status: "no_tickets",
}

/**
 * `/api/me` must be mocked before the first navigation: `requireAdmin` redirects to the
 * SAML2 endpoint when it resolves falsy, which navigates the browser off the app.
 */
export async function mockApi(page: Page) {
  // Registered first on purpose: Playwright matches routes in reverse registration order,
  // so this catch-all must be the oldest handler or it swallows every mock below it.
  // Without it an unmatched /api/* falls through to the SPA fallback and returns index.html
  // with a 200, which fails as a JSON parse error rather than as a clear 404.
  await page.route("**/api/**", (route) =>
    route.fulfill({
      status: 404,
      contentType: "application/json",
      body: JSON.stringify({ error: "not mocked" }),
    }),
  )

  await page.route("**/api/me", (route) => json(route, anonymousAuth))

  await page.route("**/api/event/get_upcoming", (route) =>
    json(route, [{ ...event, eventgroup }]),
  )

  await page.route("**/api/eventgroup", (route) => json(route, [eventgroup]))

  await page.route("**/api/eventgroup/1*", (route) =>
    json(route, { ...eventgroup, events: [event], daythemes: [] }),
  )

  await page.route("**/api/event/1*", (route) =>
    json(route, { ...event, eventgroup, ticketgroups: [] }),
  )
}
