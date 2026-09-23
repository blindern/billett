import { HttpClient } from "@angular/common/http"
import { Component, inject } from "@angular/core"
import { rxResource } from "@angular/core/rxjs-interop"
import { RouterLink } from "@angular/router"
import { api } from "../../api"
import { ApiEvent, ApiEventgroup } from "../../apitypes"
import { getErrorText } from "../../common/errors"
import { PagePropertyComponent } from "../../common/page-property.component"
import { EventgroupService } from "../eventgroup/eventgroup.service"
import { GuestEventlistItemComponent } from "../eventgroup/eventlist-item.component"

type UpcomingItem = ApiEvent & {
  eventgroup: ApiEventgroup
}

@Component({
  selector: "billett-guest-index",
  standalone: true,
  imports: [RouterLink, GuestEventlistItemComponent, PagePropertyComponent],
  templateUrl: "./index.component.html",
})
export class GuestIndexComponent {
  private http = inject(HttpClient)
  private eventgroupService = inject(EventgroupService)

  getErrorText = getErrorText

  upcomingResource = rxResource({
    stream: () => this.http.get<UpcomingItem[]>(api("event/get_upcoming")),
  })

  eventgroupsResource = rxResource({
    stream: () => this.eventgroupService.getList(),
  })
}
