import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core"
import { api } from "../../api"
import { Paginated } from "../../common/pagination.component"

export interface AdminTicketForCheckinData {
  id: number
  order: {
    id: number
    [k: string]: any
  }
  ticketgroup: {
    id: number
    [k: string]: any
  }
  [k: string]: any
}

export type AdminOrderSearchData = Paginated<
  {
    id: number
    tickets: {
      id: number
      event: {
        id: number
        [k: string]: any
      }
      ticketgroup: {
        id: number
        [k: string]: any
      }
      [k: string]: any
    }[]
    payments: {
      id: number
      [k: string]: any
    }[]
    is_valid: boolean
    order_text_id: string
    time: number
    name: string | null
    email: string | null
    phone: string | null
    balance: string
  }[]
>

export interface CheckinOrCheckoutData {
  id: number
  [k: string]: any
}

@Injectable({
  providedIn: "root",
})
export class AdminEventCheckinService {
  constructor(private http: HttpClient) {}

  getAllTickets(eventId: number) {
    return this.http.get<AdminTicketForCheckinData[]>(api("ticket"), {
      params: {
        filter: `event_id=${eventId}`,
        order: "-time",
        with: "order,ticketgroup",
      },
    })
  }

  getLastUsedTickets(eventId: number) {
    return this.http.get<Paginated<AdminTicketForCheckinData[]>>(
      api("ticket"),
      {
        params: {
          filter: `event_id=${eventId},used:NOTNULL`,
          limit: 10,
          order: "-used",
          with: "order,ticketgroup",
        },
      },
    )
  }

  searchForOrders(page: number, filter: string) {
    const limit = 6
    return this.http.get<AdminOrderSearchData>(api("order"), {
      params: {
        admin: 1,
        order: "-time",
        with: "tickets.event,tickets.ticketgroup,payments",
        limit: limit,
        offset: limit * (page - 1),
        filter: filter,
      },
    })
  }

  checkin(ticketId: number) {
    return this.http.post<any>(api(`ticket/${ticketId}/checkin`), null)
  }

  checkout(ticketId: number) {
    return this.http.post<any>(api(`ticket/${ticketId}/checkout`), null)
  }
}
