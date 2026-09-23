import { Dialog, DIALOG_DATA, DialogRef } from "@angular/cdk/dialog"
import { Component, inject, signal } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { finalize } from "rxjs"
import { ApiPaymentgroupAdmin } from "../../apitypes"
import { toastErrorHandler } from "../../common/errors"
import { PagePropertyComponent } from "../../common/page-property.component"
import { ToastService } from "../../common/toast.service"
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
  static open(dialog: Dialog, data: AdminPaymentgroupCreateModalInput) {
    return dialog.open<
      AdminPaymentgroupCreateModalResult,
      AdminPaymentgroupCreateModalInput
    >(AdminPaymentgroupCreateModal, {
      data,
    })
  }

  data = inject<AdminPaymentgroupCreateModalInput>(DIALOG_DATA)

  private dialogRef = inject(DialogRef<AdminPaymentgroupCreateModalResult>)
  private adminPaymentgroupService = inject(AdminPaymentgroupService)
  private toastService = inject(ToastService)

  sending = signal(false)

  title = ""
  description = ""

  complete() {
    this.sending.set(true)
    this.adminPaymentgroupService
      .create({
        eventgroup_id: this.data.eventgroupId,
        title: this.title,
        description: this.description,
      })
      .pipe(
        finalize(() => {
          this.sending.set(false)
        }),
      )
      .subscribe({
        next: (paymentgroup) => {
          this.sending.set(false)
          this.dialogRef.close(paymentgroup)
        },
        error: toastErrorHandler(this.toastService),
      })
  }

  cancel() {
    this.dialogRef.close()
  }
}
