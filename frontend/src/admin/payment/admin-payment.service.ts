import { Dialog } from "@angular/cdk/dialog"
import { HttpClient } from "@angular/common/http"
import { inject, Injectable } from "@angular/core"
import { api } from "../../api"
import {
  ApiOrderAdmin,
  ApiPaymentAdmin,
  ApiPaymentgroupAdmin,
} from "../../apitypes"
import {
  AdminPaymentCreateModal,
  AdminPaymentCreateModalInput,
  AdminPaymentCreateModalResult,
} from "./admin-payment-create-modal.component"

@Injectable({
  providedIn: "root",
})
export class AdminPaymentService {
  private http = inject(HttpClient)
  private dialog = inject(Dialog)

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

  openCreateModal(data: AdminPaymentCreateModalInput) {
    return this.dialog.open<
      AdminPaymentCreateModalResult,
      AdminPaymentCreateModalInput
    >(AdminPaymentCreateModal, {
      data,
    })
  }
}
