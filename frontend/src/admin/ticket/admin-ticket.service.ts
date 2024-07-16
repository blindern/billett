import { HttpClient } from "@angular/common/http"
import { inject, Injectable } from "@angular/core"
import { api } from "../../api"

@Injectable({
  providedIn: "root",
})
export class AdminTicketService {
  private http = inject(HttpClient)

  delete(id: number) {
    return this.http.delete(api(`ticket/${encodeURIComponent(id)}`), {
      responseType: "text",
    })
  }
}
