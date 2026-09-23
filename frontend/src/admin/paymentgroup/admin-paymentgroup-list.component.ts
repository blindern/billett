import { Dialog } from "@angular/cdk/dialog"
import { Component, inject, input } from "@angular/core"
import { rxResource } from "@angular/core/rxjs-interop"
import { RouterLink } from "@angular/router"
import { FormatdatePipe } from "../../common/formatdate.pipe"
import { PagePropertyComponent } from "../../common/page-property.component"
import { PageStatesComponent } from "../../common/page-states.component"
import { AdminEventgroupService } from "../eventgroup/admin-eventgroup.service"
import { AdminPaymentgroupCreateModal } from "./admin-paymentgroup-create-modal.component"
import { AdminPaymentgroupService } from "./admin-paymentgroup.service"

@Component({
  selector: "billett-admin-paymentgroup-list",
  standalone: true,
  imports: [
    PagePropertyComponent,
    RouterLink,
    PageStatesComponent,
    FormatdatePipe,
  ],
  templateUrl: "./admin-paymentgroup-list.component.html",
})
export class AdminPaymentgroupListComponent {
  private adminEventgroupService = inject(AdminEventgroupService)
  private adminPaymentgroupService = inject(AdminPaymentgroupService)
  private dialog = inject(Dialog)

  eventgroupId = input.required<string>()

  eventgroupResource = rxResource({
    params: () => this.eventgroupId(),
    stream: ({ params }) => this.adminEventgroupService.get(params),
  })

  paymentgroupsResource = rxResource({
    params: () => this.eventgroupResource.value()?.id,
    stream: ({ params }) => this.adminPaymentgroupService.list(params),
  })

  createNew() {
    AdminPaymentgroupCreateModal.open(this.dialog, {
      eventgroupId: this.eventgroupResource.value()!.id,
    }).closed.subscribe((paymentgroup) => {
      if (paymentgroup) {
        this.paymentgroupsResource.reload()
      }
    })
  }
}
