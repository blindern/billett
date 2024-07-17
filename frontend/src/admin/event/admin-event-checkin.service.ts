import { HttpClient } from "@angular/common/http"
import { inject, Injectable } from "@angular/core"
import { api } from "../../api"
import {
  ApiEventAdmin,
  ApiOrderAdmin,
  ApiPaymentAdmin,
  ApiTicketAdmin,
  ApiTicketgroupAdmin,
  Paginated,
} from "../../apitypes"

export type AdminTicketForCheckinData = ApiTicketAdmin & {
  order: ApiOrderAdmin
  ticketgroup: ApiTicketgroupAdmin
}

export type AdminOrderSearchData = Paginated<
  ApiOrderAdmin & {
    tickets: (ApiTicketAdmin & {
      event: ApiEventAdmin
      ticketgroup: ApiTicketgroupAdmin
    })[]
    payments: ApiPaymentAdmin[]
  }
>

export interface CheckinOrCheckoutData {
  id: number
  [k: string]: any
}

@Injectable({
  providedIn: "root",
})
export class AdminEventCheckinService {
  private http = inject(HttpClient)

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
    return this.http.get<Paginated<AdminTicketForCheckinData>>(api("ticket"), {
      params: {
        filter: `event_id=${eventId},used:NOTNULL`,
        limit: 10,
        order: "-used",
        with: "order,ticketgroup",
      },
    })
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
