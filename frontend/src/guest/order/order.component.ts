import { HttpClient } from "@angular/common/http"
import { Component, inject, OnInit } from "@angular/core"
import { RouterLink } from "@angular/router"
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
import {
  handleResourceLoadingStates,
  ResourceLoadingState,
} from "../../common/resource-loading"

type Order = ApiOrder & {
  tickets: (ApiTicket & {
    event: ApiEvent
    ticketgroup: ApiTicketgroup
  })[]
}

@Component({
  selector: "billett-guest-order",
  standalone: true,
  imports: [RouterLink, PagePropertyComponent, FormatdatePipe, PricePipe],
  templateUrl: "./order.component.html",
})
export class GuestOrderComponent implements OnInit {
  private http = inject(HttpClient)

  getErrorText = getErrorText

  orderState = new ResourceLoadingState()
  order?: Order
  payment?: ApiPayment

  ngOnInit(): void {
    this.http
      .get<{
        order: Order
        payment: ApiPayment
      }>(api("order/receipt"))
      .pipe(handleResourceLoadingStates(this.orderState))
      .subscribe((data) => {
        this.order = data.order
        this.payment = data.payment
      })
  }
}
