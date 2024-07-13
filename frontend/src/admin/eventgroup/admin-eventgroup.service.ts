import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core"
import { api } from "../../api"

export interface AdminEventgroupData {
  id: number
  title: string
  [k: string]: any
}

export interface AdminSoldTicketsStatsData {
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

  create(data: { title: string; is_active: boolean }) {
    return this.http.post<AdminEventgroupData>(api("eventgroup"), data, {
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

  update(data: AdminEventgroupData) {
    return this.http.put<AdminEventgroupData>(
      api(`eventgroup/${encodeURIComponent(data.id)}`),
      data,
      { params: { admin: "1" } },
    )
  }

  getSoldTicketsStats(id: string) {
    return this.http.get<AdminSoldTicketsStatsData>(
      api(`eventgroup/${encodeURIComponent(id)}/sold_tickets_stats`),
      { params: { admin: "1" } },
    )
  }
}
