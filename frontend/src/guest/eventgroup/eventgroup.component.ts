import moment from "moment"
import { CommonModule } from "@angular/common"
import { HttpClient } from "@angular/common/http"
import { Component, Input, OnInit } from "@angular/core"
import { EventgroupExpanded, EventgroupService } from "./eventgroup.service"
import { FormatdatePipe } from "../../common/formatdate.pipe"

@Component({
  selector: "app-guest-eventgroup",
  standalone: true,
  imports: [CommonModule, FormatdatePipe],
  templateUrl: "./eventgroup.component.html",
})
export class GuestEventgroupComponent implements OnInit {
  @Input()
  id!: string

  @Input()
  query!: string

  // TODO(migrate): AuthService.hasRole("billett.admin")
  has_role_admin = false

  daythemes!: Record<string, any>
  days!: Record<string, EventgroupExpanded["events"]>
  isFilter!: boolean
  group: EventgroupExpanded | undefined

  #categories: (string | null)[] = []
  categoryNum = (category: string | null) => {
    let i = this.#categories.indexOf(category)
    if (i == -1) {
      i = this.#categories.push(category) - 1
    }
    return i
  }

  constructor(
    private http: HttpClient,
    private eventgroupService: EventgroupService,
  ) {}

  // TODO(migrate): Page.setTitle("Arrangementgruppe")

  ngOnInit(): void {
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

    // const loader = Page.setLoading()
    this.eventgroupService.get(this.id).subscribe((eventgroup) => {
      // loader()
      // Page.setTitle(response.data.title)
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
        // Page.set404() // TODO
        //$location.path('eventgroup/' + ret.id);
      }

      this.days = r
    })

    // TODO(migrate)
    /*
      .catch(function () {
        loader()
        Page.set404()
      })
      */
  }
}
