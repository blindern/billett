import { Dialog, DIALOG_DATA, DialogRef } from "@angular/cdk/dialog"
import { Component, inject, Inject } from "@angular/core"
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

  constructor(
    @Inject(DIALOG_DATA)
    public data: AdminPaymentgroupSelectModalInput,
  ) {}

  private dialogRef = inject(DialogRef)

  handling = false
  paymentgroup?: ApiPaymentgroupAdmin

  complete() {
    this.handling = true
    this.data
      .handler(this.paymentgroup!)
      .pipe(
        finalize(() => {
          this.handling = false
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
