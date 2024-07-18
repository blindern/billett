import { HttpClient } from "@angular/common/http"
import { inject, Injectable } from "@angular/core"
import { api } from "../../api"
import { ApiPaymentgroupAdmin } from "../../apitypes"

@Injectable({
  providedIn: "root",
})
export class AdminTicketService {
  private http = inject(HttpClient)

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
}
