import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core"
import { api } from "../../api"

export interface Eventgroup {
  id: number
  title: string
}

export interface EventgroupExpanded {
  id: number
  title: string
  events: {
    id: number
    alias: string | null
    title: string
    category: string | null
    time_start: number
    location: string | null
    web_selling_status: string
    ticket_info: string | null
  }[]
  daythemes: {
    id: number
    title: string
    date: number
  }[]
}

@Injectable({
  providedIn: "root",
})
export class EventgroupService {
  constructor(private http: HttpClient) {}

  getList() {
    return this.http.get<Eventgroup[]>(api("eventgroup"))
  }

  get(id: string) {
    return this.http.get<EventgroupExpanded>(
      api("eventgroup/" + encodeURIComponent(id)),
    )
  }
}
