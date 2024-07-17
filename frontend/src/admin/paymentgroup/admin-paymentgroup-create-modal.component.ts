import { DIALOG_DATA, DialogRef } from "@angular/cdk/dialog"
import { Component, inject, Inject } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { ApiPaymentgroupAdmin } from "../../apitypes"
import { PagePropertyComponent } from "../../common/page-property.component"
import { AdminPaymentgroupService } from "./admin-paymentgroup.service"

export interface AdminPaymentgroupCreateModalInput {
  eventgroupId: number
}

export type AdminPaymentgroupCreateModalResult = ApiPaymentgroupAdmin

@Component({
  selector: "billett-admin-paymentgroup-create-modal",
  standalone: true,
  imports: [PagePropertyComponent, FormsModule],
  templateUrl: "./admin-paymentgroup-create-modal.component.html",
})
export class AdminPaymentgroupCreateModal {
  constructor(
    @Inject(DIALOG_DATA)
    public data: AdminPaymentgroupCreateModalInput,
  ) {}

  private dialogRef = inject(DialogRef<AdminPaymentgroupCreateModalResult>)
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
