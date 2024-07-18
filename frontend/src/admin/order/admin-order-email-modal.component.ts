import { Dialog, DIALOG_DATA, DialogRef } from "@angular/cdk/dialog"
import { Component, inject, Inject } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { ApiEventgroupAdmin, ApiOrderAdmin } from "../../apitypes"
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
      .subscribe({
        next: () => {
          this.sending = false
          this.dialogRef.close({
            completed: true,
          })
        },
        error: (err) => {
          this.sending = false
          console.error(err)
          alert(err.message)
        },
      })
  }

  cancel() {
    this.dialogRef.close()
  }
}
