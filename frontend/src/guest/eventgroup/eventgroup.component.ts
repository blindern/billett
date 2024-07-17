import { CommonModule } from "@angular/common"
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

@Component({
  selector: "app-guest-eventgroup",
  standalone: true,
  imports: [
    CommonModule,
    FormatdatePipe,
    RouterLink,
    PagePropertyComponent,
    PageStatesComponent,
  ],
  templateUrl: "./eventgroup.component.html",
})
export class GuestEventgroupComponent implements OnInit {
  private eventgroupService = inject(EventgroupService)
  private router = inject(Router)
  private page = inject(PageService)
  public auth = inject(AuthService)

  @Input()
  id!: string

  @Input()
  query!: string

  pageState = new ResourceLoadingState()

  daythemes!: Record<string, any>
  days!: Record<string, EventgroupExpanded["events"]>
  isFilter!: boolean
  group: EventgroupExpanded | undefined

  #categories: (string | null)[] = []

  categoryNum(category: string | null) {
    let i = this.#categories.indexOf(category)
    if (i == -1) {
      i = this.#categories.push(category) - 1
    }
    return i
  }

  ngOnInit(): void {
    this.page.set("title", "Arrangementgruppe")
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
        this.page.set("title", eventgroup.title)
        this.group = eventgroup

        const r: any = {}
        let c = 0
        for (const item of this.group.events) {
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

        for (const item of this.group.daythemes) {
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
