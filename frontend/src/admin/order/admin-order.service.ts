import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core"
import { api } from "../../api"
import {
  ApiEventAdmin,
  ApiEventgroupAdmin,
  ApiOrderAdmin,
  ApiPaymentAdmin,
  ApiPaymentgroupAdmin,
  ApiTicketAdmin,
  ApiTicketgroupAdmin,
  Paginated,
} from "../../apitypes"

export type AdminOrderData = Paginated<
  ApiOrderAdmin & {
    tickets: (ApiTicketAdmin & {
      event: ApiEventAdmin
      ticketgroup: ApiTicketgroupAdmin
    })[]
    payments: ApiPaymentAdmin[]
  }
>

export type AdminOrderGetData = ApiOrderAdmin & {
  eventgroup: ApiEventgroupAdmin
  tickets: (ApiTicketAdmin & {
    event: ApiEventAdmin
    ticketgroup: ApiTicketgroupAdmin
  })[]
  payments: (ApiPaymentAdmin & {
    paymentgroup: ApiPaymentgroupAdmin
  })[]
}

@Injectable({
  providedIn: "root",
})
export class AdminOrderService {
  constructor(private http: HttpClient) {}

  query(options: { page?: number; filter: string; limit?: number }) {
    const limit = options.limit ?? 20
    return this.http.get<AdminOrderData>(api("order"), {
      params: {
        admin: 1,
        order: "-time",
        with: "tickets.event,tickets.ticketgroup,payments",
        limit,
        offset: limit * ((options.page ?? 1) - 1),
        filter: options.filter,
      },
    })
  }

  get(id: string) {
    return this.http.get<AdminOrderGetData>(
      api(`order/${encodeURIComponent(id)}`),
      {
        params: {
          admin: "1",
        },
      },
    )
  }

  update(data: ApiOrderAdmin) {
    return this.http.put<AdminOrderGetData>(
      api(`order/${encodeURIComponent(data.id)}`),
      data,
    )
  }

  create(data: Partial<ApiOrderAdmin>) {
    return this.http.post<AdminOrderGetData>(api("order"), data)
  }

  delete(id: number) {
    return this.http.delete(api(`order/${encodeURIComponent(id)}`), {
      responseType: "text",
    })
  }

  sendEmail(orderId: number, email: string, text: string) {
    const params: Record<string, string> = {}
    if (email) params.email = email
    if (text) params.text = text
    return this.http.post(api(`order/${orderId}/email`), params)
  }

  createTickets(orderId: number, ticketgroupToCount: Record<number, number>) {
    return this.http.post<ApiTicketAdmin[]>(
      api(`order/${orderId}/create_tickets`),
      {
        ticketgroups: ticketgroupToCount,
      },
    )
  }

  validate(
    orderId: number,
    paymentgroup: ApiPaymentgroupAdmin,
    amount: number,
  ) {
    return this.http.post<ApiOrderAdmin>(api(`order/${orderId}/validate`), {
      paymentgroup: paymentgroup.id,
      amount,
      sendmail: true,
    })
  }
}
