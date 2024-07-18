import { Dialog } from "@angular/cdk/dialog"
import { Component, inject, OnInit } from "@angular/core"
import { RouterLink } from "@angular/router"
import { ApiEventgroupAdmin } from "../../apitypes"
import { PagePropertyComponent } from "../../common/page-property.component"
import { AdminEventgroupService } from "../eventgroup/admin-eventgroup.service"
import { AdminPrinterTextModal } from "../printer/admin-printer-text-modal.component"

@Component({
  selector: "billett-admin-index",
  standalone: true,
  imports: [PagePropertyComponent, RouterLink],
  templateUrl: "./index.component.html",
})
export class AdminIndexComponent implements OnInit {
  eventgroups?: ApiEventgroupAdmin[]

  private adminEventgroupService = inject(AdminEventgroupService)
  private dialog = inject(Dialog)

  printText() {
    AdminPrinterTextModal.open(this.dialog)
  }

  ngOnInit(): void {
    this.adminEventgroupService.query().subscribe((data) => {
      this.eventgroups = data
    })
  }
}
