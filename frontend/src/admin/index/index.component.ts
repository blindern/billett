import { Component, inject, OnInit } from "@angular/core"
import { RouterLink } from "@angular/router"
import { ApiEventgroupAdmin } from "../../apitypes"
import { PagePropertyComponent } from "../../common/page-property.component"
import { AdminEventgroupService } from "../eventgroup/admin-eventgroup.service"
import { AdminPrinterService } from "../printer/admin-printer.service"

@Component({
  selector: "billett-admin-index",
  standalone: true,
  imports: [PagePropertyComponent, RouterLink],
  templateUrl: "./index.component.html",
})
export class AdminIndexComponent implements OnInit {
  eventgroups?: ApiEventgroupAdmin[]

  private adminEventgroupService = inject(AdminEventgroupService)
  private adminPrinterService = inject(AdminPrinterService)

  printText(e: MouseEvent) {
    e.preventDefault()
    this.adminPrinterService.printTextModal()
  }

  ngOnInit(): void {
    this.adminEventgroupService.query().subscribe((data) => {
      this.eventgroups = data
    })
  }
}
