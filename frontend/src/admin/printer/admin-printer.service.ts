import { HttpClient } from "@angular/common/http"
import { inject, Injectable } from "@angular/core"
import { api } from "../../api"
import {
  ApiPrinterAdmin,
  ApiTicketAdmin,
  ApiTicketgroupAdmin,
} from "../../apitypes"

@Injectable({
  providedIn: "root",
})
export class AdminPrinterService {
  private http = inject(HttpClient)

  getList() {
    return this.http.get<ApiPrinterAdmin[]>(api("printer"))
  }

  printTickets(printer: ApiPrinterAdmin, tickets: ApiTicketAdmin[]) {
    return this.http.post(
      api(`ticket/print/${encodeURIComponent(printer.name)}`),
      {
        ids: tickets.map((it) => it.id),
      },
      {
        responseType: "text",
      },
    )
  }

  printTicket(printer: ApiPrinterAdmin, ticket: ApiTicketAdmin) {
    return this.http.post(
      api(
        `ticket/${encodeURIComponent(ticket.id)}/print/${encodeURIComponent(printer.name)}`,
      ),
      null,
      {
        responseType: "text",
      },
    )
  }

  printPreviewTicket(
    printer: ApiPrinterAdmin,
    ticketgroup: ApiTicketgroupAdmin,
  ) {
    return this.http.post(
      api(
        `ticketgroup/${encodeURIComponent(ticketgroup.id)}/previewticket/print/${encodeURIComponent(printer.name)}`,
      ),
      null,
      {
        responseType: "text",
      },
    )
  }

  printText(printername: string, text: string) {
    return this.http.post(
      api(`printer/${encodeURIComponent(printername)}/text`),
      {
        text,
      },
      {
        responseType: "text",
      },
    )
  }

  setPreferred(printer: ApiPrinterAdmin | undefined, forceEmpty?: boolean) {
    if (printer != null || forceEmpty) {
      if (printer) {
        sessionStorage.setItem("billett.printer.default", printer.name)
      } else {
        sessionStorage.removeItem("billett.printer.default")
      }
    }
  }

  getPreferred(list: ApiPrinterAdmin[], overrideName?: string) {
    if (overrideName) {
      const found = list.find((it) => it.name === overrideName)
      if (found) {
        return found
      }
    }

    const lastName = sessionStorage.getItem("billett.printer.default")
    if (!lastName) {
      return undefined
    }

    return list.find((it) => it.name === lastName) ?? undefined
  }
}
