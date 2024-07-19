import { HttpClient } from "@angular/common/http"
import { inject, Injectable } from "@angular/core"
import { api } from "../../api"
import {
  ApiEventAdmin,
  ApiEventgroupAdmin,
  ApiTicketgroupAdmin,
} from "../../apitypes"

export type AdminTicketgroupData = ApiTicketgroupAdmin & {
  event: ApiEventAdmin & {
    eventgroup: ApiEventgroupAdmin
  }
}

@Injectable({
  providedIn: "root",
})
export class AdminTicketgroupService {
  private http = inject(HttpClient)

  get(id: string) {
    return this.http.get<AdminTicketgroupData>(
      api(`ticketgroup/${encodeURIComponent(id)}`),
      {
        params: {
          admin: "1",
        },
      },
    )
  }

  create(
    data: Omit<
      ApiTicketgroupAdmin,
      "id" | "created_at" | "updated_at" | "order" | "has_tickets"
    >,
  ) {
    return this.http.post<ApiTicketgroupAdmin>(api("ticketgroup"), data)
  }

  update(data: ApiTicketgroupAdmin) {
    return this.http.put<AdminTicketgroupData>(
      api(`ticketgroup/${encodeURIComponent(data.id)}`),
      data,
    )
  }

  delete(id: number) {
    return this.http.delete(api(`ticketgroup/${encodeURIComponent(id)}`), {
      responseType: "text",
    })
  }
}
