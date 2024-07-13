import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core"
import { api } from "../../api"

export interface AdminEventgroupData {
  id: number
  [k: string]: any
}

@Injectable({
  providedIn: "root",
})
export class AdminEventgroupService {
  constructor(private http: HttpClient) {}

  query() {
    return this.http.get<AdminEventgroupData[]>(api("eventgroup"), {
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

  update(id: string, data: AdminEventgroupData) {
    return this.http.put<AdminEventgroupData>(
      api(`eventgroup/${encodeURIComponent(id)}`),
      data,
      { params: { admin: "1" } },
    )
  }

  getSoldTicketsStats(id: string) {
    return this.http.get(
      api(`eventgroup/${encodeURIComponent(id)}/sold_tickets_stats`),
      { params: { admin: "1" } },
    )
  }
}
