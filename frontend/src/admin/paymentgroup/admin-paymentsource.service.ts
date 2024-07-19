import { HttpClient } from "@angular/common/http"
import { inject, Injectable } from "@angular/core"
import { api } from "../../api"
import { ApiPaymentsourceAdmin } from "../../apitypes"

@Injectable({
  providedIn: "root",
})
export class AdminPaymentsourceService {
  private http = inject(HttpClient)

  create(
    data: Pick<
      ApiPaymentsourceAdmin,
      "paymentgroup_id" | "amount" | "title" | "comment" | "type" | "data"
    >,
  ) {
    return this.http.post<ApiPaymentsourceAdmin>(api("paymentsource"), data)
  }

  delete(id: number) {
    return this.http.delete(api(`paymentsource/${encodeURIComponent(id)}`), {
      responseType: "text",
    })
  }
}
