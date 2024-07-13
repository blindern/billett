import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core"
import { api } from "../../api"

export interface AdminEventData {
  id: number
  [k: string]: any
}

@Injectable({
  providedIn: "root",
})
export class AdminEventService {
  constructor(private http: HttpClient) {}

  query() {
    return this.http.get<AdminEventData[]>(api("event"), {
      params: { admin: "1" },
    })
  }

  get(id: string) {
    return this.http.get<AdminEventData>(
      api(`event/${encodeURIComponent(id)}`),
      {
        params: { admin: "1" },
      },
    )
  }

  update(id: string, data: AdminEventData) {
    return this.http.put<AdminEventData>(
      api(`event/${encodeURIComponent(id)}`),
      data,
      { params: { admin: "1" } },
    )
  }

  setPublish(id: string, is_published: boolean) {
    return this.http.patch<AdminEventData>(
      api(`event/${encodeURIComponent(id)}`),
      {
        is_published,
        admin: 1,
      },
    )
  }

  setSelling(id: string, is_selling: boolean) {
    return this.http.patch<AdminEventData>(
      api(`event/${encodeURIComponent(id)}`),
      {
        is_selling,
        admin: 1,
      },
    )
  }

  setTicketgroupsOrder(id: string, groups) {
    let data = {
      admin: 1,
    }

    let i = 0
    groups.forEach((group) => {
      data[group.id] = i++
    })

    return this.http.post(
      api(`event/${encodeURIComponent(id)}/ticketgroups_order`),
      data,
    )
  }
}
