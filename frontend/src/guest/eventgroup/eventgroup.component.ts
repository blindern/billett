import { AsyncPipe, KeyValuePipe } from "@angular/common"
import { Component, computed, effect, inject, input } from "@angular/core"
import { rxResource } from "@angular/core/rxjs-interop"
import { Router, RouterLink } from "@angular/router"
import { ApiEvent } from "../../apitypes"
import { AuthService } from "../../auth/auth.service"
import { FormatdatePipe } from "../../common/formatdate.pipe"
import moment from "../../common/moment"
import { PagePropertyComponent } from "../../common/page-property.component"
import { PageStatesComponent } from "../../common/page-states.component"
import { EventgroupService } from "./eventgroup.service"
import { GuestEventlistItemComponent } from "./eventlist-item.component"

@Component({
  selector: "billett-guest-eventgroup",
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
export class GuestEventgroupComponent {
  private eventgroupService = inject(EventgroupService)
  private router = inject(Router)
  public authService = inject(AuthService)

  id = input.required<string>()
  query = input<string>()

  eventgroupResource = rxResource({
    params: () => this.id(),
    stream: ({ params }) => this.eventgroupService.get(params),
  })

  filter = computed(() => {
    const query = this.query()
    if (!query) return undefined
    const date = moment(query, "YYYY-MM-DD")
    return date.isValid()
      ? { date: date.format("YYYY-MM-DD") }
      : { category: query }
  })

  days = computed(() => {
    const days: Record<string, ApiEvent[]> = {}
    if (!this.eventgroupResource.hasValue()) return days
    const filter = this.filter()
    for (const item of this.eventgroupResource.value().events) {
      if (
        filter?.category &&
        filter.category != (item.category ?? "").toLowerCase()
      )
        continue

      const day = moment.unix(item.time_start - 3600 * 6).format("YYYY-MM-DD")
      if (filter?.date && filter.date != day) continue

      ;(days[day] ??= []).push(item)
    }
    return days
  })

  daythemes = computed(() =>
    Object.fromEntries(
      (this.eventgroupResource.value()?.daythemes ?? []).map((item) => [
        moment.unix(item.date).format("YYYY-MM-DD"),
        item.title,
      ]),
    ),
  )

  constructor() {
    effect(() => {
      if (
        this.eventgroupResource.hasValue() &&
        this.filter() &&
        Object.keys(this.days()).length === 0
      ) {
        void this.router.navigateByUrl(
          "eventgroup/" + this.eventgroupResource.value().id,
        )
      }
    })
  }
}
