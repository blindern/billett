import { Dialog, DIALOG_DATA, DialogRef } from "@angular/cdk/dialog"
import { Component, inject, signal } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { finalize, Observable } from "rxjs"
import { ApiPaymentgroupAdmin } from "../../apitypes"
import { PricePipe } from "../../common/price.pipe"
import { AdminPaymentgroupSelectboxComponent } from "./admin-paymentgroup-selectbox.component"

export interface AdminPaymentgroupSelectModalInput {
  eventgroupId: number
  actionText: string
  amount: number
  handler: (printer: ApiPaymentgroupAdmin) => Observable<unknown>
}

@Component({
  selector: "billett-admin-paymentgroup-select-modal",
  standalone: true,
  imports: [AdminPaymentgroupSelectboxComponent, PricePipe, FormsModule],
  templateUrl: "./admin-paymentgroup-select-modal.component.html",
})
export class AdminPaymentgroupSelectModal {
  static open(dialog: Dialog, data: AdminPaymentgroupSelectModalInput) {
    return dialog.open<void, AdminPaymentgroupSelectModalInput>(
      AdminPaymentgroupSelectModal,
      {
        data,
      },
    )
  }

  data = inject<AdminPaymentgroupSelectModalInput>(DIALOG_DATA)

  private dialogRef = inject(DialogRef)

  handling = signal(false)
  paymentgroup = signal<ApiPaymentgroupAdmin | undefined>(undefined)

  complete() {
    this.handling.set(true)
    this.data
      .handler(this.paymentgroup()!)
      .pipe(
        finalize(() => {
          this.handling.set(false)
        }),
      )
      .subscribe(() => {
        this.dialogRef.close()
      })
  }

  cancel() {
    this.dialogRef.close()
  }
}
