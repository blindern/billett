import { HttpClient } from "@angular/common/http"
import { Component, inject, OnInit } from "@angular/core"
import { RouterLink } from "@angular/router"
import { api } from "../../api"
import { ApiEvent, ApiEventgroup } from "../../apitypes"
import { AuthService } from "../../auth/auth.service"
import { getErrorText } from "../../common/errors"
import { FormatdatePipe } from "../../common/formatdate.pipe"
import { PagePropertyComponent } from "../../common/page-property.component"
import {
  handleResourceLoadingStates,
  ResourceLoadingState,
} from "../../common/resource-loading"
import { EventgroupService } from "../eventgroup/eventgroup.service"
import { GuestEventlistItemComponent } from "../eventgroup/eventlist-item.component"

type UpcomingItem = ApiEvent & {
  eventgroup: ApiEventgroup
}

@Component({
  selector: "billett-guest-index",
  standalone: true,
  imports: [
    RouterLink,
    FormatdatePipe,
    GuestEventlistItemComponent,
    PagePropertyComponent,
  ],
  templateUrl: "./index.component.html",
})
export class GuestIndexComponent implements OnInit {
  private http = inject(HttpClient)
  private eventgroupService = inject(EventgroupService)
  public authService = inject(AuthService)

  getErrorText = getErrorText

  upcomingState = new ResourceLoadingState()
  upcoming?: UpcomingItem[]

  eventgroupsState = new ResourceLoadingState()
  eventgroups?: ApiEventgroup[]

  ngOnInit(): void {
    this.http
      .get<UpcomingItem[]>(api("event/get_upcoming"))
      .pipe(handleResourceLoadingStates(this.upcomingState))
      .subscribe((data) => {
        this.upcoming = data
      })

    this.eventgroupService
      .getList()
      .pipe(handleResourceLoadingStates(this.eventgroupsState))
      .subscribe((data) => {
        this.eventgroups = data
      })
  }
}
