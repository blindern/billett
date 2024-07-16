import { Dialog } from "@angular/cdk/dialog"
import { HttpClient } from "@angular/common/http"
import { inject, Injectable } from "@angular/core"
import { api } from "../../api"
import { ApiPaymentgroupAdmin, ApiTicketAdmin } from "../../apitypes"
import {
  AdminTicketRevokeComponent,
  AdminTicketRevokeComponentInput,
} from "./admin-ticket-revoke.component"

@Injectable({
  providedIn: "root",
})
export class AdminTicketService {
  private http = inject(HttpClient)
  private dialog = inject(Dialog)

  delete(id: number) {
    return this.http.delete(api(`ticket/${encodeURIComponent(id)}`), {
      responseType: "text",
    })
  }

  revoke(id: number, paymentgroupId: number) {
    return this.http.post(
      api(`ticket/${encodeURIComponent(id)}/revoke`),
      {
        paymentgroup_id: paymentgroupId,
      },
      {
        responseType: "text",
      },
    )
  }

  validateAndConvert(ticketId: number, paymentgroup: ApiPaymentgroupAdmin) {
    return this.http.post(
      api(`ticket/${encodeURIComponent(ticketId)}/validate`),
      {
        paymentgroup_id: paymentgroup.id,
      },
      {
        responseType: "text",
      },
    )
  }

  revokeModal(data: AdminTicketRevokeComponentInput) {
    return this.dialog.open<ApiTicketAdmin, AdminTicketRevokeComponentInput>(
      AdminTicketRevokeComponent,
      {
        data,
      },
    ).closed
  }
}
