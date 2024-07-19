import { Dialog } from "@angular/cdk/dialog"
import { Component, inject, OnInit } from "@angular/core"
import { RouterLink } from "@angular/router"
import { ApiEventgroupAdmin } from "../../apitypes"
import { PagePropertyComponent } from "../../common/page-property.component"
import { PageStatesComponent } from "../../common/page-states.component"
import {
  handleResourceLoadingStates,
  ResourceLoadingState,
} from "../../common/resource-loading"
import { AdminEventgroupService } from "../eventgroup/admin-eventgroup.service"
import { AdminPrinterTextModal } from "../printer/admin-printer-text-modal.component"

@Component({
  selector: "billett-admin-index",
  standalone: true,
  imports: [PagePropertyComponent, RouterLink, PageStatesComponent],
  templateUrl: "./index.component.html",
})
export class AdminIndexComponent implements OnInit {
  eventgroups?: ApiEventgroupAdmin[]

  private adminEventgroupService = inject(AdminEventgroupService)
  private dialog = inject(Dialog)

  pageState = new ResourceLoadingState()

  printText() {
    AdminPrinterTextModal.open(this.dialog)
  }

  ngOnInit(): void {
    this.adminEventgroupService
      .query()
      .pipe(handleResourceLoadingStates(this.pageState))
      .subscribe((data) => {
        this.eventgroups = data
      })
  }
}
