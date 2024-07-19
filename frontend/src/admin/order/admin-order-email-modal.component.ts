import { Dialog, DIALOG_DATA, DialogRef } from "@angular/cdk/dialog"
import { Component, inject, Inject } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { finalize } from "rxjs"
import { ApiEventgroupAdmin, ApiOrderAdmin } from "../../apitypes"
import { toastErrorHandler } from "../../common/errors"
import { ToastService } from "../../common/toast.service"
import { AdminOrderService } from "./admin-order.service"

export interface AdminOrderEmailModalInput {
  order: ApiOrderAdmin & {
    eventgroup: ApiEventgroupAdmin
  }
}

export interface AdminOrderEmailModalResult {
  completed: true
}

@Component({
  selector: "billett-admin-order-email-modal",
  standalone: true,
  imports: [FormsModule],
  templateUrl: "./admin-order-email-modal.component.html",
})
export class AdminOrderEmailModal {
  static open(dialog: Dialog, data: AdminOrderEmailModalInput) {
    return dialog.open<AdminOrderEmailModalResult, AdminOrderEmailModalInput>(
      AdminOrderEmailModal,
      {
        data,
      },
    )
  }

  constructor(
    @Inject(DIALOG_DATA)
    public data: AdminOrderEmailModalInput,
  ) {}

  private dialogRef = inject(DialogRef<AdminOrderEmailModalResult>)
  private adminOrderService = inject(AdminOrderService)
  private toastService = inject(ToastService)

  sending = false

  email = ""
  text = ""

  submit() {
    this.sending = true
    this.adminOrderService
      .sendEmail({
        orderId: this.data.order.id,
        email: this.email,
        text: this.text,
      })
      .pipe(
        finalize(() => {
          this.sending = false
        }),
      )
      .subscribe({
        next: () => {
          this.dialogRef.close({
            completed: true,
          })
        },
        error: toastErrorHandler(this.toastService),
      })
  }

  cancel() {
    this.dialogRef.close()
  }
}
