import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core"
import { api } from "../../api"
import { ApiEvent, ApiEventgroup, ApiTicketgroup } from "../../apitypes"

export type Event = ApiEvent & {
  eventgroup: ApiEventgroup
  ticketgroups: ApiTicketgroup[]
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
