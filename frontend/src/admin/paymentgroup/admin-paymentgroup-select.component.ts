import { DIALOG_DATA, DialogRef } from "@angular/cdk/dialog"
import { Component, inject, Inject } from "@angular/core"
import { ApiPaymentgroupAdmin } from "../../apitypes"
import { PricePipe } from "../../common/price.pipe"
import { AdminPaymentgroupSelectboxComponent } from "./admin-paymentgroup-selectbox.component"

export interface AdminPaymentgroupSelectComponentInput {
  eventgroupId: number
  actionText: string
  amount: number
}

@Component({
  selector: "admin-paymentgroup-select",
  standalone: true,
  imports: [AdminPaymentgroupSelectboxComponent, PricePipe],
  templateUrl: "./admin-paymentgroup-select.component.html",
})
export class AdminPaymentgroupSelectComponent {
  constructor(
    @Inject(DIALOG_DATA)
    public data: AdminPaymentgroupSelectComponentInput,
  ) {}

  private dialogRef = inject(DialogRef<ApiPaymentgroupAdmin>)

  paymentgroup?: ApiPaymentgroupAdmin

  complete() {
    this.dialogRef.close(this.paymentgroup)
  }

  cancel() {
    this.dialogRef.close()
  }
}
