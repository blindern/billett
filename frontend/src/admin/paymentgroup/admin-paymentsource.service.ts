import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core"
import { api } from "../../api"

@Injectable({
  providedIn: "root",
})
export class AdminPaymentsourceService {
  constructor(private http: HttpClient) {}

  delete(id: number) {
    return this.http.delete(api(`paymentsource/${encodeURIComponent(id)}`), {
      responseType: "text",
    })
  }

  /*
  get(id: string) {
    return this.http.get<ApiPaymentgroupAdmin>(
      api(`paymentsource/${encodeURIComponent(id)}`),
      {
        params: {
          admin: "1",
        },
      },
    )
  }
  */

  /* TODO(migrate)
  r.newModal = (paymentgroup) => {
    return $modal.open({
      template: paymentsourceNewTemplate,
      controller: "AdminPaymentsourceNewController as ctrl",
      resolve: {
        paymentgroup: () => {
          return paymentgroup
        },
      },
    })
  }

  r.selectModal = (resolve) => {
    return $modal.open({
      template: paymentgroupSelectTemplate,
      controller: "AdminPaymentgroupSelectController as ctrl",
      resolve: resolve,
    })
  }
  */
}
