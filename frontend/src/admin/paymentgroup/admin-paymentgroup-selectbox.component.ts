import { Dialog } from "@angular/cdk/dialog"
import { Component, inject, input, model } from "@angular/core"
import { rxResource } from "@angular/core/rxjs-interop"
import { FormsModule } from "@angular/forms"
import { tap } from "rxjs"
import { ApiPaymentgroupAdmin } from "../../apitypes"
import { getErrorText } from "../../common/errors"
import { FormatdatePipe } from "../../common/formatdate.pipe"
import { AdminPaymentgroupCreateModal } from "./admin-paymentgroup-create-modal.component"
import { AdminPaymentgroupService } from "./admin-paymentgroup.service"

@Component({
  selector: "billett-admin-paymentgroup-selectbox",
  imports: [FormsModule, FormatdatePipe],
  templateUrl: "./admin-paymentgroup-selectbox.component.html",
})
export class AdminPaymentgroupSelectboxComponent {
  private adminPaymentgroupService = inject(AdminPaymentgroupService)
  private dialog = inject(Dialog)

  getErrorText = getErrorText

  eventgroupId = input.required<number>()
  paymentgroup = model<ApiPaymentgroupAdmin>()

  paymentgroupsResource = rxResource({
    params: () => this.eventgroupId(),
    stream: ({ params }) =>
      this.adminPaymentgroupService.listValid(params).pipe(
        tap((paymentgroups) => {
          const preferred = this.adminPaymentgroupService.getPreferredGroup(
            paymentgroups,
            this.paymentgroup()?.id,
          )
          if (this.paymentgroup()?.id !== preferred?.id) {
            this.paymentgroup.set(preferred)
          }
        }),
      ),
  })

  createNew() {
    AdminPaymentgroupCreateModal.open(this.dialog, {
      eventgroupId: this.eventgroupId(),
    }).closed.subscribe((paymentgroup) => {
      if (paymentgroup) {
        this.paymentgroupsResource.update((list) => [
          ...(list ?? []),
          paymentgroup,
        ])
        this.select(paymentgroup.id)
      }
    })
  }

  select(id: number | "") {
    const paymentgroup = this.paymentgroupsResource
      .value()
      ?.find((it) => it.id === id)
    this.paymentgroup.set(paymentgroup)
    this.adminPaymentgroupService.setPreferredGroup(paymentgroup)
  }
}
