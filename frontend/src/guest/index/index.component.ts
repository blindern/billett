import { CommonModule } from "@angular/common"
import { HttpClient } from "@angular/common/http"
import { Component } from "@angular/core"
import { Observable } from "rxjs"
import { api } from "../../api"

interface UpcomingItem {
  id: number
  location: string | null
  title: string
  alias: string | null
  category: string | null
  ticket_info: string | null
  web_selling_status: string
}

interface Eventgroup {
  id: number
  title: string
}

@Component({
  selector: "app-guest-index",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./index.component.html",
})
export class GuestIndexComponent {
  upcoming$!: Observable<UpcomingItem[]>
  eventgroups$!: Observable<Eventgroup[]>

  // TODO: AuthService.hasRole("billett.admin")
  has_role_admin = false

  categories: string[] = []
  categoryNum!: (category: string) => number

  constructor(private http: HttpClient) {}

  // TODO: Page.setTitle("Arrangementer")

  ngOnInit(): void {
    this.upcoming$ = this.http.get<UpcomingItem[]>(api("event/get_upcoming"))
    this.eventgroups$ = this.http.get<Eventgroup[]>(api("eventgroup"))

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
