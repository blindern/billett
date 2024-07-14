export interface Paginated<T> {
  pagination: {
    offset: number
    limit: number
    total: number
  }
  result: T[]
}

export interface ApiAuthInfo {
  logged_in: boolean
  user_roles: string[]
  user: {
    id: number
    created_at: string
    updated_at: string
    username: string
    email: string
    realname: string
    groups: string
  } | null
  is_admin: boolean
  is_dev: boolean
  is_vipps_test: boolean
  csrf_token: string
}

export interface ApiSoldTicketsStats {
  tickets: {
    day: string
    ticketgroup_id: number
    event_id: number
    num_tickets: number
    num_revoked: number
  }[]
  ticketgroups: {
    id: number
    title: string
    price: string // decimal
    fee: string // decimal
    event_id: number
  }[]
  events: {
    id: number
    title: string
    time_start: number
    category: string | null
    max_sales: number
    max_normal_sales: number | null
  }[]
}

export interface ApiDaytheme {
  id: number
  title: string
  date: number
}

export interface ApiEventgroupAdmin {
  id: number
  created_at: string
  updated_at: string
  is_active: boolean
  title: string
  sort_value: string
  paymentsources_data: {
    cash_prefix: string
    payments_deviation_prefix: string
    orders_deviation_prefix: string
    sources: {
      title: string
    }[]
  }
}

export type ApiEventgroup = Pick<ApiEventgroupAdmin, "id" | "title">

export interface ApiEventAdmin {
  id: number
  created_at: string
  updated_at: string
  eventgroup_id: number
  alias: string | null
  is_admin_hidden: boolean
  is_published: boolean
  is_selling: boolean
  time_start: number
  time_end: number | null
  title: string
  location: string | null
  ticket_info: string | null
  selling_text: string | null
  category: string | null
  max_each_person: number
  max_sales: number
  max_normal_sales: number | null
  description: string | null
  description_short: string | null
  ticket_text: string | null
  link: string | null
  age_restriction: number | null
  is_timeout: boolean
  is_old: boolean
  ticket_count: {
    totals: {
      valid: number
      pending: number
      expired: number
      revoked: number
      used: number
      free: number
      free_normal: number
      sum_price: number
      sum_fee: number
    }
    groups: Record<
      string,
      {
        valid: number
        pending: number
        expired: number
        revoked: number
        used: number
        sum_price: number
        sum_fee: number
        free: number
      }
    >
  }
  has_tickets: boolean
  web_selling_status:
    | "unknown"
    | "no_tickets"
    | "old"
    | "no_web_tickets"
    | "timeout"
    | "sold_out"
    | "sale"
}

export type ApiEvent = Pick<
  ApiEventAdmin,
  | "id"
  | "alias"
  | "is_published"
  | "time_start"
  | "time_end"
  | "title"
  | "location"
  | "ticket_info"
  | "selling_text"
  | "category"
  | "max_each_person"
  | "description"
  | "description_short"
  | "link"
  | "age_restriction"
  | "web_selling_status"
>

export interface ApiOrderAdmin {
  id: number
  eventgroup_id: number
  created_at: string
  updated_at: string
  order_text_id: string | null
  is_locked: boolean
  is_valid: boolean
  time: number
  user_created: string | null
  ip: string | null
  browser: string | null
  name: string | null
  email: string | null
  phone: string | null
  recruiter: string | null
  is_admin: boolean
  comment: string | null
  balance: string // decimal
}

export interface ApiPaymentgroupAdmin {
  id: number
  eventgroup_id: number
  created_at: string
  updated_at: string
  time_start: number
  time_end: number | null
  title: string
  user_created: string | null
  user_closed: string | null
  description: string | null
}

export interface ApiPaymentAdmin {
  id: number
  created_at: string
  updated_at: string
  order_id: number
  paymentgroup_id: number | null
  time: number
  user_created: string | null
  is_web: boolean
  amount: string // decimal
  transaction_id: string
  status: string
}

export interface ApiPaymentsourceAdmin {
  id: number
  created_at: string
  updated_at: string
  paymentgroup_id: number
  is_deleted: boolean
  time_created: number
  time_deleted: number | null
  user_created: string | null
  user_deleted: string | null
  type: "cash" | "other"
  title: string
  comment: string | null
  amount: number
  data: Record<string, number>
}

export interface ApiTicketgroupAdmin {
  id: number
  created_at: string
  updated_at: string
  event_id: number
  use_office: boolean
  use_web: boolean
  is_normal: boolean
  title: string
  ticket_text: string | null
  price: number
  fee: number
  limit: number | null
  order: number
}

export type ApiTicketgroup = Pick<
  ApiTicketgroupAdmin,
  "id" | "title" | "ticket_text" | "price" | "fee"
>

export interface ApiTicketAdmin {
  id: number
  created_at: string
  updated_at: string
  order_id: number
  event_id: number
  ticketgroup_id: number
  time: number
  expire: number | null
  is_valid: boolean
  is_revoked: boolean
  valid_paymentgroup_id: number | null
  revoked_paymentgroup_id: number | null
  user_valid: string | null
  user_revoked: string | null
  used: number | null
  user_used: string | null
  key: string | null
  time_revoked: number | null
  number: string // zero-padded
}
