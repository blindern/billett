import type { Page } from "@playwright/test"

// Distinctive strings so assertions key on mocked data, not on UI copy.
export const EVENTGROUP_TITLE = "Testgruppe RENDER"
export const EVENT_TITLE = "Testarrangement RENDER"
export const PAYMENTGROUP_TITLE = "Oppgjør RENDER"
export const ORDER_TEXT_ID = "RENDER-1"

// Fixed timestamp so rendered dates never depend on the clock.
const TIME = 1790000000
const STAMP = "2026-09-01 12:00:00"

const auth = (isAdmin: boolean) => ({
  logged_in: isAdmin,
  user_roles: [],
  user: isAdmin
    ? {
        id: 1,
        created_at: STAMP,
        updated_at: STAMP,
        username: "render",
        email: "render@example.com",
        realname: "Render Admin",
        groups: "ukabillettadmin",
      }
    : null,
  is_admin: isAdmin,
  is_dev: false,
  is_vipps_test: true,
  csrf_token: "render-test-csrf",
})

const eventgroup = { id: 1, title: EVENTGROUP_TITLE }

const eventgroupAdmin = {
  ...eventgroup,
  created_at: STAMP,
  updated_at: STAMP,
  is_active: true,
  sort_value: "",
  paymentsources_data: {
    cash_prefix: "Kasse",
    payments_deviation_prefix: "Avvik betaling",
    orders_deviation_prefix: "Avvik ordre",
    sources: [{ title: "Kasse" }],
  },
}

const event = {
  id: 1,
  alias: null,
  is_published: true,
  time_start: TIME,
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
  web_selling_status: "sale",
}

const ticketCount = {
  valid: 1,
  pending: 0,
  expired: 0,
  revoked: 0,
  used: 0,
  sum_price: 100,
  sum_fee: 10,
  free: 99,
}

const eventAdmin = {
  ...event,
  created_at: STAMP,
  updated_at: STAMP,
  eventgroup_id: 1,
  is_admin_hidden: false,
  is_selling: true,
  max_sales: 100,
  max_normal_sales: null,
  ticket_text: null,
  is_timeout: false,
  is_old: false,
  ticket_count: {
    totals: { ...ticketCount, free_normal: 99 },
    groups: { "1": ticketCount },
  },
  has_tickets: true,
}

const ticketgroup = {
  id: 1,
  title: "Ordinær",
  ticket_text: null,
  price: 100,
  fee: 10,
}

const ticketgroupAdmin = {
  ...ticketgroup,
  created_at: STAMP,
  updated_at: STAMP,
  event_id: 1,
  use_office: true,
  use_web: true,
  is_normal: true,
  limit: null,
  order: 0,
  has_tickets: true,
}

const order = {
  id: 1,
  email: "render@example.com",
  is_valid: true,
  name: "Ola Render",
  order_text_id: ORDER_TEXT_ID,
  phone: "12345678",
  recruiter: null,
  time: TIME,
  total_amount: 110,
}

const orderAdmin = {
  ...order,
  eventgroup_id: 1,
  created_at: STAMP,
  updated_at: STAMP,
  is_locked: false,
  user_created: "render",
  ip: null,
  browser: null,
  is_admin: true,
  comment: null,
  balance: "0.00",
}

const ticket = {
  id: 1,
  order_id: 1,
  event_id: 1,
  ticketgroup_id: 1,
  expire: null,
  number: "00001",
}

const ticketAdmin = {
  ...ticket,
  created_at: STAMP,
  updated_at: STAMP,
  time: TIME,
  is_valid: true,
  is_revoked: false,
  valid_paymentgroup_id: 1,
  revoked_paymentgroup_id: null,
  user_valid: "render",
  user_revoked: null,
  used: null,
  user_used: null,
  key: "123456",
  time_revoked: null,
}

const paymentgroupAdmin = {
  id: 1,
  eventgroup_id: 1,
  created_at: STAMP,
  updated_at: STAMP,
  time_start: TIME,
  time_end: null,
  title: PAYMENTGROUP_TITLE,
  user_created: "render",
  user_closed: null,
  description: null,
}

const payment = {
  id: 1,
  created_at: STAMP,
  updated_at: STAMP,
  order_id: 1,
  paymentgroup_id: 1,
  time: TIME,
  user_created: "render",
  is_web: false,
  amount: "110.00",
  transaction_id: "render-transaction",
  status: "ACCEPTED",
}

const paymentsource = {
  id: 1,
  created_at: STAMP,
  updated_at: STAMP,
  paymentgroup_id: 1,
  is_deleted: false,
  time_created: TIME,
  time_deleted: null,
  user_created: "render",
  user_deleted: null,
  type: "cash",
  title: "Kasse",
  comment: null,
  amount: 110,
  data: { "100": 1, "10": 1 },
}

const reservation = {
  ...order,
  id: 2,
  is_valid: false,
  tickets: [{ ...ticket, order_id: 2, event, ticketgroup }],
}

const orderWithTickets = {
  ...orderAdmin,
  tickets: [{ ...ticketAdmin, event: eventAdmin, ticketgroup: ticketgroupAdmin }],
  payments: [payment],
}

const boxOfficeTicket = {
  ...ticketAdmin,
  order_id: 3,
  is_valid: false,
  event: eventAdmin,
  ticketgroup: ticketgroupAdmin,
}

const newOrder = (tickets: (typeof boxOfficeTicket)[]) => ({
  ...orderAdmin,
  id: 3,
  order_text_id: null,
  is_valid: false,
  eventgroup: eventgroupAdmin,
  tickets,
  payments: [],
})

const paginated = <T>(result: T[]) => ({
  pagination: { offset: 0, limit: 20, total: result.length },
  result,
})

// Mirrors the backend: `?admin` only yields full models for an admin session.
type Handler = (url: URL, isAdmin: boolean, method: string) => unknown

const endpoints: Partial<Record<string, Handler>> = {
  me: (_, isAdmin) => auth(isAdmin),
  "event/get_upcoming": () => [{ ...event, eventgroup }],
  eventgroup: () => [eventgroup],
  "eventgroup/1": (url, isAdmin) =>
    url.searchParams.has("admin") && isAdmin
      ? {
          ...eventgroupAdmin,
          events: [{ ...eventAdmin, ticketgroups: [ticketgroupAdmin] }],
          daythemes: [],
        }
      : { ...eventgroup, events: [event], daythemes: [] },
  "eventgroup/1/sold_tickets_stats": () => ({
    tickets: [
      {
        day: "2026-09-01",
        ticketgroup_id: 1,
        event_id: 1,
        num_tickets: 1,
        num_revoked: 0,
      },
    ],
    ticketgroups: [
      { id: 1, title: "Ordinær", price: "100.00", fee: "10.00", event_id: 1 },
    ],
    events: [
      {
        id: 1,
        title: EVENT_TITLE,
        time_start: TIME,
        category: null,
        max_sales: 100,
        max_normal_sales: null,
      },
    ],
  }),
  "event/1": (url, isAdmin) =>
    url.searchParams.has("admin") && isAdmin
      ? {
          ...eventAdmin,
          eventgroup: eventgroupAdmin,
          ticketgroups: [ticketgroupAdmin],
        }
      : { ...event, eventgroup, ticketgroups: [ticketgroup] },
  "ticketgroup/1": () => ({
    ...ticketgroupAdmin,
    event: { ...eventAdmin, eventgroup: eventgroupAdmin },
  }),
  ticket: (url) => {
    const tickets = [
      { ...ticketAdmin, order: orderAdmin, ticketgroup: ticketgroupAdmin },
    ]
    return url.searchParams.get("filter")?.includes("used:NOTNULL")
      ? paginated([])
      : tickets
  },
  "order/1": () => ({
    ...orderAdmin,
    eventgroup: eventgroupAdmin,
    tickets: [
      { ...ticketAdmin, event: eventAdmin, ticketgroup: ticketgroupAdmin },
    ],
    payments: [{ ...payment, paymentgroup: paymentgroupAdmin }],
  }),
  "event/1/createreservation": () => reservation,
  "order/2": () => reservation,
  "order/2/force": () => ({}),
  "order/1/create_tickets": () => [],
  "ticket/1/checkin": () => ({ ...ticketAdmin, used: TIME, user_used: "render" }),
  order: (_, __, method) =>
    method === "POST" ? newOrder([]) : paginated([orderWithTickets]),
  "order/3": () => newOrder([boxOfficeTicket]),
  "order/3/create_tickets": () => [],
  "order/3/validate": () => ({ ...orderAdmin, id: 3 }),
  "order/receipt": () => ({
    order: { ...order, tickets: [{ ...ticket, event, ticketgroup }] },
    payment,
  }),
  paymentgroup: () => [paymentgroupAdmin],
  "paymentgroup/1": () => ({
    ...paymentgroupAdmin,
    eventgroup: eventgroupAdmin,
    payments: [{ ...payment, order: orderAdmin }],
    valid_tickets: [
      {
        ...ticketAdmin,
        order: orderAdmin,
        ticketgroup: ticketgroupAdmin,
        event: { ...eventAdmin, ticketgroups: [ticketgroupAdmin] },
      },
    ],
    revoked_tickets: [],
    paymentsources: [paymentsource],
  }),
  printer: () => [],
  "printer/Skriver/text": () => ({}),
  "order/1/email": () => ({}),
  "ticket/1/revoke": () => ({}),
  payment: () => payment,
  paymentsource: () => paymentsource,
}

/**
 * Must run before the first navigation: `requireAdmin` redirects to the SAML2 endpoint
 * when `/api/me` resolves falsy, which navigates the browser off the app.
 *
 * Unknown endpoints get a JSON 404; otherwise they fall through to the SPA fallback and
 * return index.html with a 200, which fails as a JSON parse error rather than a clear 404.
 */
export async function mockApi(page: Page, { admin = false } = {}) {
  await page.route("**/api/**", (route) => {
    const url = new URL(route.request().url())
    const handler = endpoints[url.pathname.replace(/^\/api\//, "")]
    return route.fulfill({
      status: handler ? 200 : 404,
      contentType: "application/json",
      body: JSON.stringify(
        handler ? handler(url, admin, route.request().method()) : { error: "not mocked" },
      ),
    })
  })
}
