import { Dialog } from "@angular/cdk/dialog"
import { Component, inject } from "@angular/core"
import { rxResource } from "@angular/core/rxjs-interop"
import { RouterLink } from "@angular/router"
import { PagePropertyComponent } from "../../common/page-property.component"
import { PageStatesComponent } from "../../common/page-states.component"
import { AdminEventgroupService } from "../eventgroup/admin-eventgroup.service"
import { AdminPrinterTextModal } from "../printer/admin-printer-text-modal.component"

@Component({
  selector: "billett-admin-index",
  standalone: true,
  imports: [PagePropertyComponent, RouterLink, PageStatesComponent],
  templateUrl: "./index.component.html",
})
export class AdminIndexComponent {
  private adminEventgroupService = inject(AdminEventgroupService)
  private dialog = inject(Dialog)

  eventgroupsResource = rxResource({
    stream: () => this.adminEventgroupService.query(),
  })

  printText() {
    AdminPrinterTextModal.open(this.dialog)
  }
}
