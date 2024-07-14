import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core"
import { api } from "../../api"
import { ApiDaytheme, ApiEvent, ApiEventgroup } from "../../apitypes"

export type EventgroupExpanded = ApiEventgroup & {
  events: ApiEvent[]
  daythemes: ApiDaytheme[]
}

@Injectable({
  providedIn: "root",
})
export class EventgroupService {
  constructor(private http: HttpClient) {}

  getList() {
    return this.http.get<ApiEventgroup[]>(api("eventgroup"))
  }

  get(id: string) {
    return this.http.get<EventgroupExpanded>(
      api("eventgroup/" + encodeURIComponent(id)),
    )
  }
}
