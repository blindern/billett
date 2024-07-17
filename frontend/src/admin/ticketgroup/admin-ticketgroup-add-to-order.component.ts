import { DIALOG_DATA, DialogRef } from "@angular/cdk/dialog"
import { NgClass } from "@angular/common"
import { Component, inject, Inject, OnInit } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { RouterLink } from "@angular/router"
import { ApiEventAdmin, ApiTicketgroupAdmin } from "../../apitypes"
import { FormatdatePipe } from "../../common/formatdate.pipe"
import { PagePropertyComponent } from "../../common/page-property.component"
import { PricePipe } from "../../common/price.pipe"
import {
  AdminEventgroupData,
  AdminEventgroupService,
} from "../eventgroup/admin-eventgroup.service"
import { AdminOrderService } from "../order/admin-order.service"

export interface AdminTicketgroupAddToOrderComponentInput {
  eventgroupId: number
  getOrderId: () => Promise<number>
}

@Component({
  selector: "billett-admin-ticketgroup-add-to-order",
  standalone: true,
  imports: [
    PagePropertyComponent,
    FormsModule,
    PricePipe,
    NgClass,
    RouterLink,
    FormatdatePipe,
  ],
  templateUrl: "./admin-ticketgroup-add-to-order.component.html",
  styleUrl: "./admin-ticketgroup-add-to-order.component.scss",
})
export class AdminTicketgroupAddToOrderComponent implements OnInit {
  constructor(
    @Inject(DIALOG_DATA)
    public data: AdminTicketgroupAddToOrderComponentInput,
  ) {}

  private dialogRef = inject(DialogRef)
  private adminEventgroupService = inject(AdminEventgroupService)
  private adminOrderService = inject(AdminOrderService)

  eventgroup?: AdminEventgroupData

  sending = false

  title = ""
  description = ""

  count = 0
  amount = 0

  ticket_search = ""
  ticketfilter = {
    show_old: false,
    show_inactive: false,
  }

  ticketgroupsToAdd: Record<
    number,
    {
      ticketgroup: ApiTicketgroupAdmin
      event: ApiEventAdmin
      num: number
    }
  > = {}

  get filteredEvents() {
    // TODO: ticket_search
    return this.events ?? []
  }

  filterTicketgroups(ticketgroups: ApiTicketgroupAdmin[]) {
    // TODO: | filter: { use_office: ticketfilter.show_inactive } : ticketgroup_check;
    // ticketgroup_check(actual, expected) {
    //   if (expected) return true
    //   return actual
    // }
    return ticketgroups
  }

  ngOnInit(): void {
    this.adminEventgroupService
      .get(String(this.data.eventgroupId))
      .subscribe((eventgroup) => {
        this.eventgroup = eventgroup
      })
  }

  submit() {
    this.sending = true
    this.data.getOrderId().then((orderId) => {
      this.adminOrderService
        .createTickets(
          orderId,
          Object.fromEntries(
            Object.values(this.ticketgroupsToAdd).map((group) => [
              group.ticketgroup.id,
              group.num,
            ]),
          ),
        )
        .subscribe({
          next: (tickets) => {
            this.sending = false
            this.dialogRef.close(tickets)
          },
          error: (err) => {
            this.sending = false
            console.error(err)
            alert("Ukjent feil oppsto ved registrering av billetter")
          },
        })
    })
  }

  cancel() {
    this.dialogRef.close()
  }

  get events() {
    if (!this.eventgroup) return []

    return this.eventgroup.events.filter((event) => {
      if (event.is_old && !this.ticketfilter.show_old) return false
      return event.is_selling && event.ticketgroups.length > 0
    })
  }

  changeTicketgroupNum(
    ticketgroup: ApiTicketgroupAdmin,
    event: ApiEventAdmin,
    num: number,
  ) {
    if (!(ticketgroup.id in this.ticketgroupsToAdd)) {
      this.ticketgroupsToAdd[ticketgroup.id] = {
        ticketgroup: ticketgroup,
        event: event,
        num: 0,
      }
    }

    var g = this.ticketgroupsToAdd[ticketgroup.id]
    g.num += num

    if (g.num == 0) {
      delete this.ticketgroupsToAdd[ticketgroup.id]
    }

    this.count += num
    this.amount += num * (ticketgroup.price + ticketgroup.fee)
  }
}
