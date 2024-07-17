import { AsyncPipe, KeyValuePipe } from "@angular/common"
import { Component, inject, Input, OnInit } from "@angular/core"
import { Router, RouterLink } from "@angular/router"
import moment from "moment"
import { AuthService } from "../../auth/auth.service"
import { FormatdatePipe } from "../../common/formatdate.pipe"
import { PagePropertyComponent } from "../../common/page-property.component"
import { PageStatesComponent } from "../../common/page-states.component"
import { PageService } from "../../common/page.service"
import {
  handleResourceLoadingStates,
  ResourceLoadingState,
} from "../../common/resource-loading"
import { EventgroupExpanded, EventgroupService } from "./eventgroup.service"
import { GuestEventlistItemComponent } from "./eventlist-item.component"

@Component({
  selector: "billett-guest-eventgroup",
  standalone: true,
  imports: [
    FormatdatePipe,
    RouterLink,
    PagePropertyComponent,
    PageStatesComponent,
    GuestEventlistItemComponent,
    AsyncPipe,
    KeyValuePipe,
  ],
  templateUrl: "./eventgroup.component.html",
  styleUrl: "./eventgroup.component.scss",
})
export class GuestEventgroupComponent implements OnInit {
  private eventgroupService = inject(EventgroupService)
  private router = inject(Router)
  private pageService = inject(PageService)
  public authService = inject(AuthService)

  @Input()
  id!: string

  @Input()
  query!: string

  pageState = new ResourceLoadingState()

  daythemes!: Record<string, any>
  days!: Record<string, EventgroupExpanded["events"]>
  isFilter!: boolean
  eventgroup?: EventgroupExpanded

  ngOnInit(): void {
    this.pageService.set("title", "Arrangementgruppe")
    this.daythemes = {}

    const filter: any = {
      date: null,
      category: null,
    }
    this.isFilter = false
    if (this.query) {
      const date = moment(this.query, "YYYY-MM-DD")
      if (date.isValid()) {
        filter.date = date.format("YYYY-MM-DD")
      } else {
        filter.category = this.query
      }
      this.isFilter = true
    }

    this.eventgroupService
      .get(this.id)
      .pipe(handleResourceLoadingStates(this.pageState))
      .subscribe((eventgroup) => {
        this.pageService.set("title", eventgroup.title)
        this.eventgroup = eventgroup

        const r: any = {}
        let c = 0
        for (const item of this.eventgroup.events) {
          if (
            filter.category &&
            filter.category != (item.category || "").toLowerCase()
          )
            continue

          const k = moment.unix(item.time_start - 3600 * 6).format("YYYY-MM-DD")
          if (filter.date && filter.date != k) continue

          r[k] = r[k] || []
          r[k].push(item)
          c++
        }

        for (const item of this.eventgroup.daythemes) {
          const day = moment.unix(item.date).format("YYYY-MM-DD")
          this.daythemes[day] = item.title
        }

        // if blank page on filter
        if (c == 0 && (filter.date || filter.category)) {
          this.pageState.notfound = true
          this.router.navigateByUrl("eventgroup/" + eventgroup.id)
        }

        this.days = r
      })
  }
}
