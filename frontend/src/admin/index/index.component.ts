import { Component, OnInit } from "@angular/core"
import { RouterLink } from "@angular/router"
import { PagePropertyComponent } from "../../common/page-property.component"
import {
  AdminEventgroupData,
  AdminEventgroupService,
} from "../eventgroup/admin-eventgroup.service"

@Component({
  selector: "admin-index",
  standalone: true,
  imports: [PagePropertyComponent, RouterLink],
  templateUrl: "./index.component.html",
})
export class AdminIndexComponent implements OnInit {
  eventgroups?: AdminEventgroupData[]

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
