import { Dialog } from "@angular/cdk/dialog"
import { HttpClient } from "@angular/common/http"
import { inject, Injectable } from "@angular/core"
import { api } from "../../api"
import { ApiPaymentgroupAdmin } from "../../apitypes"
import {
  AdminTicketRevokeModal,
  AdminTicketRevokeModalInput,
  AdminTicketRevokeModalResult,
} from "./admin-ticket-revoke-modal.component"

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

  openRevokeModal(data: AdminTicketRevokeModalInput) {
    return this.dialog.open<
      AdminTicketRevokeModalResult,
      AdminTicketRevokeModalInput
    >(AdminTicketRevokeModal, {
      data,
    })
  }
}
