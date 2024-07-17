import { HttpClient } from "@angular/common/http"
import { inject, Injectable } from "@angular/core"
import { api } from "../../api"
import {
  ApiEventAdmin,
  ApiEventgroupAdmin,
  ApiTicketgroupAdmin,
} from "../../apitypes"

export type AdminEventData = ApiEventAdmin & {
  eventgroup: ApiEventgroupAdmin
  ticketgroups: ApiTicketgroupAdmin[]
}

export type AdminEventCreateData = Partial<Omit<ApiEventAdmin, "id">>

@Injectable({
  providedIn: "root",
})
export class AdminEventService {
  private http = inject(HttpClient)

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

  create(data: AdminEventCreateData) {
    return this.http.post<AdminEventData>(api("event"), data, {
      params: { admin: "1" },
    })
  }

  update(data: AdminEventData) {
    return this.http.put<AdminEventData>(
      api(`event/${encodeURIComponent(data.id)}`),
      data,
      { params: { admin: "1" } },
    )
  }

  delete(id: number) {
    return this.http.delete(api(`event/${encodeURIComponent(id)}`), {
      responseType: "text",
    })
  }

  setPublish(id: number, is_published: boolean) {
    return this.http.patch<AdminEventData>(
      api(`event/${encodeURIComponent(id)}`),
      {
        is_published,
        admin: 1,
      },
    )
  }

  setSelling(id: number, is_selling: boolean) {
    return this.http.patch<AdminEventData>(
      api(`event/${encodeURIComponent(id)}`),
      {
        is_selling,
        admin: 1,
      },
    )
  }

  setTicketgroupsOrder(id: number, idToPos: Record<number, number>) {
    return this.http.post(
      api(`event/${encodeURIComponent(id)}/ticketgroups_order`),
      {
        admin: 1,
        ...idToPos,
      },
    )
  }

  uploadImage(id: number, file: FormData) {
    return this.http.post(api(`event/${encodeURIComponent(id)}/image`), file, {
      responseType: "text",
    })
  }
}
