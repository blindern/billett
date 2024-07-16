import { Component, OnInit } from "@angular/core"
import { RouterLink } from "@angular/router"
import { ApiEventgroupAdmin } from "../../apitypes"
import { PagePropertyComponent } from "../../common/page-property.component"
import { AdminEventgroupService } from "../eventgroup/admin-eventgroup.service"

@Component({
  selector: "admin-index",
  standalone: true,
  imports: [PagePropertyComponent, RouterLink],
  templateUrl: "./index.component.html",
})
export class AdminIndexComponent implements OnInit {
  eventgroups?: ApiEventgroupAdmin[]

  constructor(private adminEventgroupService: AdminEventgroupService) {}

  printText(e: MouseEvent) {
    e.preventDefault()
    // TODO(migrate)
    // AdminPrinter.printTextModal()
  }

  ngOnInit(): void {
    this.adminEventgroupService.query().subscribe((data) => {
      this.eventgroups = data
    })
  }
}
