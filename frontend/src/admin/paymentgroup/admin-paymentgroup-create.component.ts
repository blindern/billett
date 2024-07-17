import { DIALOG_DATA, DialogRef } from "@angular/cdk/dialog"
import { Component, inject, Inject } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { PagePropertyComponent } from "../../common/page-property.component"
import { AdminPaymentgroupService } from "./admin-paymentgroup.service"

export interface AdminPaymentgroupCreateComponentInput {
  eventgroupId: number
}

@Component({
  selector: "billett-admin-paymentgroup-create",
  standalone: true,
  imports: [PagePropertyComponent, FormsModule],
  templateUrl: "./admin-paymentgroup-create.component.html",
})
export class AdminPaymentgroupCreateComponent {
  constructor(
    @Inject(DIALOG_DATA)
    public data: AdminPaymentgroupCreateComponentInput,
  ) {}

  private dialogRef = inject(DialogRef)
  private adminPaymentgroupService = inject(AdminPaymentgroupService)

  sending = false

  title = ""
  description = ""

  complete() {
    this.sending = true
    this.adminPaymentgroupService
      .create({
        eventgroup_id: this.data.eventgroupId,
        title: this.title,
        description: this.description,
      })
      .subscribe({
        next: (paymentgroup) => {
          this.sending = false
          this.dialogRef.close(paymentgroup)
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
