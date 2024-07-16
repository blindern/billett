import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core"
import { api } from "../../api"
import {
  ApiDaytheme,
  ApiEventAdmin,
  ApiEventgroupAdmin,
  ApiSoldTicketsStats,
  ApiTicketgroupAdmin,
} from "../../apitypes"

export type AdminEventgroupData = ApiEventgroupAdmin & {
  events: (ApiEventAdmin & {
    ticketgroups: ApiTicketgroupAdmin[]
  })[]
  daythemes: ApiDaytheme[]
}

@Injectable({
  providedIn: "root",
})
export class AdminEventgroupService {
  constructor(private http: HttpClient) {}

  query() {
    return this.http.get<ApiEventgroupAdmin[]>(api("eventgroup"), {
      params: { admin: "1" },
    })
  }

  create(data: { title: string; is_active: boolean }) {
    return this.http.post<ApiEventgroupAdmin>(api("eventgroup"), data, {
      params: { admin: "1" },
    })
  }

  get(id: string) {
    return this.http.get<AdminEventgroupData>(
      api(`eventgroup/${encodeURIComponent(id)}`),
      {
        params: { admin: "1" },
      },
    )
  }

  update(data: ApiEventgroupAdmin) {
    return this.http.put<ApiEventgroupAdmin>(
      api(`eventgroup/${encodeURIComponent(data.id)}`),
      data,
      { params: { admin: "1" } },
    )
  }

  getSoldTicketsStats(id: string) {
    return this.http.get<ApiSoldTicketsStats>(
      api(`eventgroup/${encodeURIComponent(id)}/sold_tickets_stats`),
      { params: { admin: "1" } },
    )
  }
}
