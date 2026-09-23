import { Dialog, DIALOG_DATA, DialogRef } from "@angular/cdk/dialog"
import { Component, inject, OnInit, signal } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { finalize } from "rxjs"
import {
  ApiEventgroupAdmin,
  ApiOrderAdmin,
  ApiPaymentAdmin,
  ApiPaymentgroupAdmin,
} from "../../apitypes"
import { toastErrorHandler } from "../../common/errors"
import { ToastService } from "../../common/toast.service"
import { AdminPaymentgroupSelectboxComponent } from "../paymentgroup/admin-paymentgroup-selectbox.component"
import { AdminPaymentService } from "./admin-payment.service"

export interface AdminPaymentCreateModalInput {
  order: ApiOrderAdmin & {
    eventgroup: ApiEventgroupAdmin
  }
}

export type AdminPaymentCreateModalResult = ApiPaymentAdmin

@Component({
  selector: "billett-admin-payment-create-modal",
  imports: [FormsModule, AdminPaymentgroupSelectboxComponent],
  templateUrl: "./admin-payment-create-modal.component.html",
})
export class AdminPaymentCreateModal implements OnInit {
  static open(dialog: Dialog, data: AdminPaymentCreateModalInput) {
    return dialog.open<
      AdminPaymentCreateModalResult,
      AdminPaymentCreateModalInput
    >(AdminPaymentCreateModal, {
      data,
    })
  }

  data = inject<AdminPaymentCreateModalInput>(DIALOG_DATA)

  private dialogRef = inject(DialogRef<AdminPaymentCreateModalResult>)
  private adminPaymentService = inject(AdminPaymentService)
  private toastService = inject(ToastService)

  sending = signal(false)

  paymentgroup = signal<ApiPaymentgroupAdmin | undefined>(undefined)
  amount = 0

  ngOnInit(): void {
    this.amount = -parseFloat(this.data.order.balance)
  }

  submit() {
    this.sending.set(true)
    this.adminPaymentService
      .create({
        order: this.data.order,
        paymentgroup: this.paymentgroup()!,
        amount: this.amount,
      })
      .pipe(
        finalize(() => {
          this.sending.set(false)
        }),
      )
      .subscribe({
        next: (payment) => {
          this.dialogRef.close(payment)
        },
        error: toastErrorHandler(this.toastService),
      })
  }

  cancel() {
    this.dialogRef.close()
  }
}
