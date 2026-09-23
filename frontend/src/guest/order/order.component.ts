import { HttpClient } from "@angular/common/http"
import { Component, inject } from "@angular/core"
import { rxResource } from "@angular/core/rxjs-interop"
import { api } from "../../api"
import {
  ApiEvent,
  ApiOrder,
  ApiPayment,
  ApiTicket,
  ApiTicketgroup,
} from "../../apitypes"
import { getErrorText } from "../../common/errors"
import { FormatdatePipe } from "../../common/formatdate.pipe"
import { PagePropertyComponent } from "../../common/page-property.component"
import { PricePipe } from "../../common/price.pipe"

type Order = ApiOrder & {
  tickets: (ApiTicket & {
    event: ApiEvent
    ticketgroup: ApiTicketgroup
  })[]
}

@Component({
  selector: "billett-guest-order",
  standalone: true,
  imports: [PagePropertyComponent, FormatdatePipe, PricePipe],
  templateUrl: "./order.component.html",
  preserveWhitespaces: false,
})
export class GuestOrderComponent {
  private http = inject(HttpClient)

  getErrorText = getErrorText

  receiptResource = rxResource({
    stream: () =>
      this.http.get<{ order: Order; payment: ApiPayment }>(
        api("order/receipt"),
      ),
  })
}
