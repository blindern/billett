import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core"
import { api } from "../../api"
import {
  ApiEventAdmin,
  ApiEventgroupAdmin,
  ApiOrderAdmin,
  ApiPaymentAdmin,
  ApiPaymentgroupAdmin,
  ApiPaymentsourceAdmin,
  ApiTicketAdmin,
  ApiTicketgroupAdmin,
} from "../../apitypes"

export type AdminPaymentgroupData = ApiPaymentgroupAdmin & {
  eventgroup: ApiEventgroupAdmin
  payments: (ApiPaymentAdmin & {
    order: ApiOrderAdmin
  })[]
  valid_tickets: (ApiTicketAdmin & {
    order: ApiOrderAdmin
    ticketgroup: ApiTicketgroupAdmin
    event: ApiEventAdmin & {
      ticketgroups: ApiTicketgroupAdmin[]
    }
  })[]
  revoked_tickets: (ApiTicketAdmin & {
    order: ApiOrderAdmin
    ticketgroup: ApiTicketgroupAdmin
    event: ApiEventAdmin & {
      ticketgroups: ApiTicketgroupAdmin[]
    }
  })[]
  paymentsources: ApiPaymentsourceAdmin[]
}

export type AdminEventCreateData = Partial<Omit<ApiEventAdmin, "id">>

@Injectable({
  providedIn: "root",
})
export class AdminPaymentgroupService {
  constructor(private http: HttpClient) {}

  get(id: string) {
    return this.http.get<AdminPaymentgroupData>(
      api(`paymentgroup/${encodeURIComponent(id)}`),
      {
        params: {
          admin: "1",
        },
      },
    )
  }

  list(eventgroupId: number) {
    return this.http.get<ApiPaymentgroupAdmin[]>(api("paymentgroup"), {
      params: {
        admin: "1",
        filter: "eventgroup_id=" + eventgroupId,
        order: "time_end:NOTNULL,-time_end,-time_start",
      },
    })
  }

  listValid(eventgroupId: number) {
    return this.http.get<ApiPaymentgroupAdmin[]>(api("paymentgroup"), {
      params: {
        admin: "1",
        filter: `eventgroup_id=${eventgroupId},time_end:NULL`,
      },
    })
  }

  update(data: { id: number; title: string; description: string | null }) {
    return this.http.put<
      ApiPaymentgroupAdmin & {
        eventgroup: ApiEventgroupAdmin
      }
    >(api(`paymentgroup/${data.id}`), data)
  }

  close(id: number) {
    return this.http.post<
      ApiPaymentgroupAdmin & {
        eventgroup: ApiEventgroupAdmin
      }
    >(api(`paymentgroup/${id}/close`), null)
  }
}
