import { Dialog, DIALOG_DATA, DialogRef } from "@angular/cdk/dialog"
import { NgClass } from "@angular/common"
import { Component, computed, inject, signal } from "@angular/core"
import { rxResource } from "@angular/core/rxjs-interop"
import { FormsModule } from "@angular/forms"
import { RouterLink } from "@angular/router"
import { ApiTicketAdmin, ApiTicketgroupAdmin } from "../../apitypes"
import { getErrorText, toastErrorHandler } from "../../common/errors"
import { FormatdatePipe } from "../../common/formatdate.pipe"
import { PricePipe } from "../../common/price.pipe"
import { ToastService } from "../../common/toast.service"
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
  imports: [FormsModule, PricePipe, NgClass, RouterLink, FormatdatePipe],
  templateUrl: "./admin-ticketgroup-add-to-order-modal.component.html",
  styleUrl: "./admin-ticketgroup-add-to-order-modal.component.scss",
})
export class AdminTicketgroupAddToOrderModal {
  static open(dialog: Dialog, data: AdminTicketgroupAddToOrderModalInput) {
    return dialog.open<
      AdminTicketgroupAddToOrderModalResult,
      AdminTicketgroupAddToOrderModalInput
    >(AdminTicketgroupAddToOrderModal, {
      data,
    })
  }

  data = inject<AdminTicketgroupAddToOrderModalInput>(DIALOG_DATA)

  private dialogRef = inject(DialogRef<AdminTicketgroupAddToOrderModalResult>)
  private adminEventgroupService = inject(AdminEventgroupService)
  private adminOrderService = inject(AdminOrderService)
  private toastService = inject(ToastService)

  getErrorText = getErrorText

  eventgroupResource = rxResource({
    stream: () =>
      this.adminEventgroupService.get(String(this.data.eventgroupId)),
  })

  sending = signal(false)

  ticketSearch = signal("")
  showOld = signal(false)
  showInactive = signal(false)

  ticketgroupsToAdd = signal<
    Record<number, { ticketgroup: ApiTicketgroupAdmin; num: number }>
  >({})

  count = computed(() =>
    Object.values(this.ticketgroupsToAdd()).reduce((acc, g) => acc + g.num, 0),
  )

  amount = computed(() =>
    Object.values(this.ticketgroupsToAdd()).reduce(
      (acc, g) => acc + g.num * (g.ticketgroup.price + g.ticketgroup.fee),
      0,
    ),
  )

  events = computed(() =>
    (this.eventgroupResource.value()?.events ?? []).filter((event) => {
      if (event.is_old && !this.showOld()) return false
      return event.is_selling && event.ticketgroups.length > 0
    }),
  )

  filteredEvents = computed(() =>
    this.events().filter((event) =>
      this.#matchEvent(this.ticketSearch(), event),
    ),
  )

  #matchEvent(text: string, event: AdminEventgroupData["events"][number]) {
    // A very naive search algorithm for now.

    text = text.toLowerCase()
    if (!text) return true

    if (event.title.toLowerCase().includes(text)) return true

    if (event.description?.toLowerCase().includes(text)) return true

    for (const ticketgroup of event.ticketgroups) {
      if (ticketgroup.title.toLowerCase().includes(text)) return true
    }

    return false
  }

  filterTicketgroups(ticketgroups: ApiTicketgroupAdmin[]) {
    return this.showInactive()
      ? ticketgroups
      : ticketgroups.filter((ticketgroup) => ticketgroup.use_office)
  }

  getNum(ticketgroup: ApiTicketgroupAdmin) {
    return this.ticketgroupsToAdd()[ticketgroup.id]?.num ?? 0
  }

  showAll() {
    this.ticketSearch.set("")
    this.showOld.set(true)
    this.showInactive.set(true)
  }

  submit() {
    this.sending.set(true)
    void this.data.getOrderId().then((orderId) => {
      this.adminOrderService
        .createTickets(
          orderId,
          Object.fromEntries(
            Object.values(this.ticketgroupsToAdd()).map((group) => [
              group.ticketgroup.id,
              group.num,
            ]),
          ),
        )
        .subscribe({
          next: (tickets) => {
            this.sending.set(false)
            this.dialogRef.close(tickets)
          },
          error: toastErrorHandler(
            this.toastService,
            "Feil oppsto ved registrering av billetter",
          ),
        })
    })
  }

  cancel() {
    this.dialogRef.close()
  }

  changeTicketgroupNum(ticketgroup: ApiTicketgroupAdmin, num: number) {
    this.ticketgroupsToAdd.update((current) => {
      const { [ticketgroup.id]: existing, ...rest } = current
      const next = (existing?.num ?? 0) + num
      return next == 0
        ? rest
        : { ...rest, [ticketgroup.id]: { ticketgroup, num: next } }
    })
  }
}
