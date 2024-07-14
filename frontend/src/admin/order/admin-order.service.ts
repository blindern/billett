import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core"
import { api } from "../../api"
import {
  ApiEventAdmin,
  ApiOrderAdmin,
  ApiPaymentAdmin,
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

@Injectable({
  providedIn: "root",
})
export class AdminOrderService {
  constructor(private http: HttpClient) {}

  query(page: number, filter: string) {
    const limit = 20
    return this.http.get<AdminOrderData>(api("order"), {
      params: {
        admin: 1,
        order: "-time",
        with: "tickets.event,tickets.ticketgroup,payments",
        limit: limit,
        offset: limit * (page - 1),
        filter,
      },
    })
  }

  sendEmail(orderId: number, email: string, text: string) {
    const params: Record<string, string> = {}
    if (email) params.email = email
    if (text) params.text = text
    return this.http.post(api(`order/${orderId}/email`), params)
  }

  /* TODO(migrate)
  addTicketsModal(resolve) {
    return $modal.open({
      // "../ticketgroup/add_ticketgroup_to_order.html?raw"
      template: addTicketgroupToOrderTemplate,
      controller: "AdminTicketgroupAddToOrderController as ctrl",
      resolve: resolve,
    })
  }
  */
}
