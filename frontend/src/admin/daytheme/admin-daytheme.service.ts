import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core"
import { api } from "../../api"

export interface AdminDaythemeCreateData {
  eventgroup_id: number
  title?: string
  date?: number
}

@Injectable({
  providedIn: "root",
})
export class AdminDaythemeService {
  constructor(private http: HttpClient) {}

  create(data: AdminDaythemeCreateData) {
    return this.http.post<AdminDaythemeCreateData>(api("daytheme"), data, {
      params: { admin: "1" },
    })
  }
}
