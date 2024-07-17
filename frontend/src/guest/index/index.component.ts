import { CommonModule } from "@angular/common"
import { HttpClient } from "@angular/common/http"
import { Component, inject, OnInit } from "@angular/core"
import { RouterLink } from "@angular/router"
import { api } from "../../api"
import { ApiEvent, ApiEventgroup } from "../../apitypes"
import { AuthService } from "../../auth/auth.service"
import { FormatdatePipe } from "../../common/formatdate.pipe"
import { EventgroupService } from "../eventgroup/eventgroup.service"

type UpcomingItem = ApiEvent & {
  eventgroup: ApiEventgroup
}

@Component({
  selector: "billett-guest-index",
  standalone: true,
  imports: [CommonModule, RouterLink, FormatdatePipe],
  templateUrl: "./index.component.html",
})
export class GuestIndexComponent implements OnInit {
  private http = inject(HttpClient)
  private eventgroupService = inject(EventgroupService)
  public authService = inject(AuthService)

  upcoming?: UpcomingItem[]
  eventgroups?: ApiEventgroup[]

  categories: string[] = []
  categoryNum!: (category: string) => number

  ngOnInit(): void {
    this.http
      .get<UpcomingItem[]>(api("event/get_upcoming"))
      .subscribe((data) => {
        this.upcoming = data
      })

    this.eventgroupService.getList().subscribe((data) => {
      this.eventgroups = data
    })

    this.categories = []
    this.categoryNum = (category) => {
      var i = this.categories.indexOf(category)
      if (i == -1) {
        i = this.categories.push(category) - 1
      }
      return i
    }
  }
}
