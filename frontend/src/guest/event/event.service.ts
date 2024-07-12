import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core"
import { api } from "../../api"

export interface Event {
  id: number
  alias: string | null
  is_published: 1 | 0
  time_start: number
  time_end: number | null
  title: string
  location: string | null
  ticket_info: string | null
  selling_text: string | null
  category: string | null
  max_each_person: number | null
  description: string | null
  description_short: string | null
  link: string | null
  age_restriction: number | null
  web_selling_status: string | null
  eventgroup: {
    id: number
    title: string
  }
  ticketgroups: any[]
}

@Injectable({
  providedIn: "root",
})
export class EventService {
  constructor(private http: HttpClient) {}

  get(id: string) {
    return this.http.get<Event>(api("event/" + encodeURIComponent(id)))
  }
}
