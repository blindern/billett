import { Dialog, DIALOG_DATA, DialogRef } from "@angular/cdk/dialog"
import { NgClass } from "@angular/common"
import { Component, inject, Inject, OnInit } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { RouterLink } from "@angular/router"
import {
  ApiEventAdmin,
  ApiTicketAdmin,
  ApiTicketgroupAdmin,
} from "../../apitypes"
import { FormatdatePipe } from "../../common/formatdate.pipe"
import { PagePropertyComponent } from "../../common/page-property.component"
import { PricePipe } from "../../common/price.pipe"
import {
  AdminEventgroupData,
  AdminEventgroupService,
} from "../eventgroup/admin-eventgroup.service"
import { AdminOrderService } from "../order/admin-order.service"

export interface AdminTicketgroupAddToOrderModalInput {
  eventgroupId: number
  getOrderId: () => Promise<number>
}

export type AdminTicketgroupAddToOrderModalResult = ApiTicketAdmin[]

@Component({
  selector: "billett-admin-ticketgroup-add-to-order-modal",
  standalone: true,
  imports: [
    PagePropertyComponent,
    FormsModule,
    PricePipe,
    NgClass,
    RouterLink,
    FormatdatePipe,
  ],
  templateUrl: "./admin-ticketgroup-add-to-order-modal.component.html",
  styleUrl: "./admin-ticketgroup-add-to-order-modal.component.scss",
})
export class AdminTicketgroupAddToOrderModal implements OnInit {
  static open(dialog: Dialog, data: AdminTicketgroupAddToOrderModalInput) {
    return dialog.open<
      AdminTicketgroupAddToOrderModalResult,
      AdminTicketgroupAddToOrderModalInput
    >(AdminTicketgroupAddToOrderModal, {
      data,
    })
  }

  constructor(
    @Inject(DIALOG_DATA)
    public data: AdminTicketgroupAddToOrderModalInput,
  ) {}

  private dialogRef = inject(DialogRef<AdminTicketgroupAddToOrderModalResult>)
  private adminEventgroupService = inject(AdminEventgroupService)
  private adminOrderService = inject(AdminOrderService)

  eventgroup?: AdminEventgroupData

  sending = false

  title = ""
  description = ""

  count = 0
  amount = 0

  ticketSearch = ""
  showOld = false
  showInactive = false

  ticketgroupsToAdd: Record<
    number,
    {
      ticketgroup: ApiTicketgroupAdmin
      event: ApiEventAdmin
      num: number
    }
  > = {}

  #matchEvent(
    text: string,
    event: ApiEventAdmin & {
      ticketgroups: ApiTicketgroupAdmin[]
    },
  ) {
    // A very naive search algorithm for now.

    text = text.toLowerCase()
    if (!text) return true

    if (event.title.toLowerCase().includes(text)) return true

    if (event.description && event.description.toLowerCase().includes(text))
      return true

    for (const ticketgroup of event.ticketgroups) {
      if (ticketgroup.title.toLowerCase().includes(text)) return true
    }

    return false
  }

  get filteredEvents() {
    return (this.events ?? []).filter((event) =>
      this.#matchEvent(this.ticketSearch, event),
    )
  }

  filterTicketgroups(ticketgroups: ApiTicketgroupAdmin[]) {
    if (this.showInactive) {
      return ticketgroups
    } else {
      return ticketgroups.filter((ticketgroup) => ticketgroup.use_office)
    }
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
      if (event.is_old && !this.showOld) return false
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

    const g = this.ticketgroupsToAdd[ticketgroup.id]
    g.num += num

    if (g.num == 0) {
      delete this.ticketgroupsToAdd[ticketgroup.id]
    }

    this.count += num
    this.amount += num * (ticketgroup.price + ticketgroup.fee)
  }
}
