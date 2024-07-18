import { HttpClient } from "@angular/common/http"
import { inject, Injectable } from "@angular/core"
import { api } from "../../api"
import {
  ApiOrderAdmin,
  ApiPaymentAdmin,
  ApiPaymentgroupAdmin,
} from "../../apitypes"

@Injectable({
  providedIn: "root",
})
export class AdminPaymentService {
  private http = inject(HttpClient)

  create(options: {
    order: ApiOrderAdmin
    paymentgroup: ApiPaymentgroupAdmin
    amount: number
  }) {
    return this.http.post<ApiPaymentAdmin>(api("payment"), {
      order_id: options.order.id,
      paymentgroup_id: options.paymentgroup.id,
      amount: options.amount,
    })
  }
}
