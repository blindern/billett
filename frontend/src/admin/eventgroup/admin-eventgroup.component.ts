import { CommonModule } from "@angular/common"
import { Component, inject, Input, OnInit } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { RouterLink } from "@angular/router"
import moment from "moment"
import { FormatdatePipe } from "../../common/formatdate.pipe"
import { PagePropertyComponent } from "../../common/page-property.component"
import { PageStatesComponent } from "../../common/page-states.component"
import { PageService } from "../../common/page.service"
import { PricePipe } from "../../common/price.pipe"
import {
  handleResourceLoadingStates,
  ResourceLoadingState,
} from "../../common/resource-loading"
import { AdminEventService } from "../event/admin-event.service"
import { AdminEventgroupService } from "./admin-eventgroup.service"

@Component({
  selector: "billett-admin-eventgroup",
  standalone: true,
  imports: [
    PagePropertyComponent,
    RouterLink,
    FormsModule,
    CommonModule,
    FormatdatePipe,
    PricePipe,
    PageStatesComponent,
  ],
  templateUrl: "./admin-eventgroup.component.html",
  styleUrl: "./admin-eventgroup.component.scss",
})
export class AdminEventgroupComponent implements OnInit {
  private adminEventgroupService = inject(AdminEventgroupService)
  private adminEventService = inject(AdminEventService)
  private pageService = inject(PageService)

  @Input()
  id!: string

  pageState = new ResourceLoadingState()

  group: any
  filter_sale: any
  filter_category: any
  filter_hidden: any
  categories: any
  days?: Record<string, any[]>

  ngOnInit(): void {
    this.pageService.set("title", "Arrangementgruppe")

    this.adminEventgroupService
      .get(this.id)
      .pipe(handleResourceLoadingStates(this.pageState))
      .subscribe((data) => {
        this.group = data
        this.applyFilter()

        this.categories = []
        for (const event of this.group.events) {
          if (this.categories.includes(event.category || "")) continue
          this.categories.push(event.category || "")
        }
        this.categories.sort()
      })

    this.filter_sale = ""
    this.filter_category = "-1"
    this.filter_hidden = "0"
  }

  applyFilter() {
    var r = {}
    for (const item of this.group.events) {
      if (
        this.filter_sale !== "" &&
        this.filter_sale != !!item.ticketgroups.length
      )
        continue
      if (
        this.filter_category !== "-1" &&
        this.filter_category != (item.category || "")
      )
        continue
      if (
        this.filter_hidden != "" &&
        this.filter_hidden != item.is_admin_hidden
      )
        continue

      var k = moment.unix(item.time_start - 3600 * 6).format("YYYY-MM-DD")
      r[k] = r[k] || []
      r[k].push(item)
    }

    this.days = r
  }

  eventTogglePublish(event) {
    this.adminEventService
      .setPublish(event.id, !event.is_published)
      .subscribe((data) => {
        event.is_published = data.is_published
      })
  }

  eventToggleSelling(event) {
    this.adminEventService
      .setSelling(event.id, !event.is_selling)
      .subscribe((data) => {
        event.is_selling = data.is_selling
      })
  }
}
