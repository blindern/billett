import { AsyncPipe, KeyValuePipe } from "@angular/common"
import {
  Component,
  inject,
  Input,
  OnChanges,
  SimpleChanges,
} from "@angular/core"
import { Router, RouterLink } from "@angular/router"
import moment from "moment"
import { ApiEvent } from "../../apitypes"
import { AuthService } from "../../auth/auth.service"
import { FormatdatePipe } from "../../common/formatdate.pipe"
import { PagePropertyComponent } from "../../common/page-property.component"
import { PageStatesComponent } from "../../common/page-states.component"
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
export class GuestEventgroupComponent implements OnChanges {
  private eventgroupService = inject(EventgroupService)
  private router = inject(Router)
  public authService = inject(AuthService)

  @Input()
  id!: string

  @Input()
  query!: string

  pageState = new ResourceLoadingState()

  daythemes: Record<string, string> = {}
  days!: Record<string, EventgroupExpanded["events"]>
  isFilter!: boolean
  eventgroup?: EventgroupExpanded

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["id"] || changes["query"]) {
      let filterDate = ""
      let filterCategory = ""

      this.isFilter = false
      if (this.query) {
        const date = moment(this.query, "YYYY-MM-DD")
        if (date.isValid()) {
          filterDate = date.format("YYYY-MM-DD")
        } else {
          filterCategory = this.query
        }
        this.isFilter = true
      }

      this.eventgroupService
        .get(this.id)
        .pipe(handleResourceLoadingStates(this.pageState))
        .subscribe((eventgroup) => {
          this.eventgroup = eventgroup

          const r: Record<string, ApiEvent[]> = {}
          let c = 0
          for (const item of this.eventgroup.events) {
            if (
              filterCategory &&
              filterCategory != (item.category ?? "").toLowerCase()
            )
              continue

            const k = moment
              .unix(item.time_start - 3600 * 6)
              .format("YYYY-MM-DD")
            if (filterDate && filterDate != k) continue

            r[k] = r[k] || []
            r[k].push(item)
            c++
          }

          for (const item of this.eventgroup.daythemes) {
            const day = moment.unix(item.date).format("YYYY-MM-DD")
            this.daythemes[day] = item.title
          }

          // if blank page on filter
          if (c == 0 && (filterDate || filterCategory)) {
            void this.router.navigateByUrl("eventgroup/" + eventgroup.id)
          }

          this.days = r
        })
    }
  }
}
