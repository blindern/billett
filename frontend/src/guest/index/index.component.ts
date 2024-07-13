import { CommonModule } from "@angular/common"
import { HttpClient } from "@angular/common/http"
import { Component, OnInit } from "@angular/core"
import { Observable } from "rxjs"
import { api } from "../../api"
import { AuthService } from "../../auth/AuthService"
import { Eventgroup, EventgroupService } from "../eventgroup/eventgroup.service"

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
  selector: "app-guest-index",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./index.component.html",
})
export class GuestIndexComponent implements OnInit {
  upcoming$!: Observable<UpcomingItem[]>
  eventgroups$!: Observable<Eventgroup[]>

  categories: string[] = []
  categoryNum!: (category: string) => number

  constructor(
    private http: HttpClient,
    private eventgroupService: EventgroupService,
    public auth: AuthService,
  ) {}

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
