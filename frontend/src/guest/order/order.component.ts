import { CommonModule } from "@angular/common"
import { HttpClient } from "@angular/common/http"
import { Component, OnInit } from "@angular/core"
import { RouterLink } from "@angular/router"
import { api } from "../../api"
import { FormatdatePipe } from "../../common/formatdate.pipe"
import { PagePropertyComponent } from "../../common/page-property.component"
import { PricePipe } from "../../common/price.pipe"

@Component({
  selector: "guest-order",
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    PagePropertyComponent,
    FormatdatePipe,
    PricePipe,
  ],
  templateUrl: "./order.component.html",
})
export class GuestOrderComponent implements OnInit {
  constructor(private http: HttpClient) {}

  order: any
  payment: any

  ngOnInit(): void {
    this.http.get<any>(api("order/receipt")).subscribe((data) => {
      this.order = data.order
      this.payment = data.payment

      // group the entries by ticketgroup
      var ticketGroups = {}
      for (const ticket of data.order.tickets) {
        if (ticket.ticketgroup.id in ticketGroups) {
          ticketGroups[ticket.ticketgroup.id][5]++
        } else {
          ticketGroups[ticket.ticketgroup.id] = [
            data.order.order_text_id,
            ticket.event.id + "-" + ticket.ticketgroup.id,
            ticket.event.title + " (" + ticket.ticketgroup.title + ")",
            ticket.event.category,
            ticket.ticketgroup.price + ticket.ticketgroup.fee,
            1,
          ]
        }
      }
    })
  }
}
