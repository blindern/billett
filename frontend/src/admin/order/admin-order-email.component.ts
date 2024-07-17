import { DIALOG_DATA, DialogRef } from "@angular/cdk/dialog"
import { Component, inject, Inject } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { ApiEventgroupAdmin, ApiOrderAdmin } from "../../apitypes"
import { AdminOrderService } from "./admin-order.service"

export interface AdminOrderEmailComponentInput {
  order: ApiOrderAdmin & {
    eventgroup: ApiEventgroupAdmin
  }
}

@Component({
  selector: "billett-admin-order-email",
  standalone: true,
  imports: [FormsModule],
  templateUrl: "./admin-order-email.component.html",
})
export class AdminOrderEmailComponent {
  constructor(
    @Inject(DIALOG_DATA)
    public data: AdminOrderEmailComponentInput,
  ) {}

  private dialogRef = inject(DialogRef)
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
          this.dialogRef.close(true)
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
