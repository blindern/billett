import { CommonModule } from "@angular/common"
import { HttpClient } from "@angular/common/http"
import { Component, inject, OnInit } from "@angular/core"
import { RouterLink } from "@angular/router"
import { Observable } from "rxjs"
import { api } from "../../api"
import { ApiEventgroup } from "../../apitypes"
import { AuthService } from "../../auth/auth.service"
import { EventgroupService } from "../eventgroup/eventgroup.service"

interface UpcomingItem {
  id: number
  location: string | null
  title: string
  alias: string | null
  category: string | null
  ticket_info: string | null
  web_selling_status: string
}

@Component({
  selector: "billett-guest-index",
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: "./index.component.html",
})
export class GuestIndexComponent implements OnInit {
  private http = inject(HttpClient)
  private eventgroupService = inject(EventgroupService)
  public auth = inject(AuthService)

  upcoming$!: Observable<UpcomingItem[]>
  eventgroups$!: Observable<ApiEventgroup[]>

  categories: string[] = []
  categoryNum!: (category: string) => number

  ngOnInit(): void {
    this.upcoming$ = this.http.get<UpcomingItem[]>(api("event/get_upcoming"))
    this.eventgroups$ = this.eventgroupService.getList()

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
