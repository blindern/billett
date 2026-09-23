import { CommonModule } from "@angular/common"
import { Component, inject, input, signal } from "@angular/core"
import { rxResource, takeUntilDestroyed } from "@angular/core/rxjs-interop"
import { FormsModule } from "@angular/forms"
import { RouterLink } from "@angular/router"
import { debounceTime, map, Subject, tap } from "rxjs"
import { api } from "../../api"
import {
  ApiEventAdmin,
  ApiOrderAdmin,
  ApiTicketAdmin,
  ApiTicketgroupAdmin,
} from "../../apitypes"
import { toastErrorHandler } from "../../common/errors"
import { FormatdatePipe } from "../../common/formatdate.pipe"
import { PagePropertyComponent } from "../../common/page-property.component"
import { PageStatesComponent } from "../../common/page-states.component"
import { PaginationComponent } from "../../common/pagination.component"
import { PricePipe } from "../../common/price.pipe"
import { ToastService } from "../../common/toast.service"
import {
  AdminEventCheckinService,
  AdminOrderSearchData,
  AdminTicketForCheckinData,
} from "./admin-event-checkin.service"
import { AdminEventService } from "./admin-event.service"

type Ticket = ApiTicketAdmin & {
  order: ApiOrderAdmin
  event: ApiEventAdmin
  ticketgroup: ApiTicketgroupAdmin
}

const searchinputInit = {
  page: 1,
  name: "",
  email: "",
  phone: "",
  id: "",
}

@Component({
  selector: "billett-admin-event-checkin",
  standalone: true,
  imports: [
    PageStatesComponent,
    PagePropertyComponent,
    RouterLink,
    FormatdatePipe,
    PricePipe,
    CommonModule,
    FormsModule,
    PaginationComponent,
  ],
  templateUrl: "./admin-event-checkin.component.html",
  styleUrl: "./admin-event-checkin.component.scss",
})
export class AdminEventCheckinComponent {
  private adminEventService = inject(AdminEventService)
  private adminEventCheckinService = inject(AdminEventCheckinService)
  private toastService = inject(ToastService)

  id = input.required<string>()

  api = api
  parseFloat = parseFloat

  eventResource = rxResource({
    params: () => this.id(),
    stream: ({ params }) =>
      this.adminEventService.get(params).pipe(tap(() => this.#loadTickets())),
  })

  lastUsedTicketsResource = rxResource({
    params: () => this.eventResource.value()?.id,
    stream: ({ params }) =>
      this.adminEventCheckinService
        .getLastUsedTickets(params)
        .pipe(map((data) => data.result)),
  })

  tickets = signal<
    ReturnType<AdminEventCheckinComponent["parseTicketsList"]> | undefined
  >(undefined)
  ticketsLoading = signal(false)
  ticketsById: Record<number, Omit<Ticket, "event">> = {}

  ticketsWorking = signal<number[]>([])

  keysearch = signal("")
  keysearchlast = ""
  keyticket = signal<Ticket | undefined>(undefined)
  keyok = signal<boolean | undefined>(undefined)

  ordersLoading = signal(false)
  orders = signal<
    ReturnType<AdminEventCheckinComponent["parseOrdersList"]> | undefined
  >(undefined)

  searchinput = signal(structuredClone(searchinputInit))

  #searchqueue = new Subject<void>()

  constructor() {
    this.#searchqueue
      .pipe(debounceTime(300), takeUntilDestroyed())
      .subscribe(() => {
        this.searchinput().page = 1
        if (this.eventResource.hasValue()) this.#searchForOrders()
        if (this.keysearch()) this.#focusKeyfield()
      })
  }

  #reloadEvent() {
    this.adminEventService.get(this.id()).subscribe({
      next: (data) => {
        this.eventResource.set(data)
      },
      error: toastErrorHandler(
        this.toastService,
        "Kunne ikke laste arrangement",
      ),
    })
  }

  #focusKeyfield() {
    const input = document.querySelector<HTMLInputElement>("#keyfield")!
    input.focus()
  }

  checkin(ticket: ApiTicketAdmin) {
    this.#performCheckin(ticket, true)
    this.#focusKeyfield()
  }
  checkout(ticket: ApiTicketAdmin) {
    this.keyok.set(undefined)
    this.keyticket.set(undefined)
    this.#performCheckin(ticket, false)
    this.#focusKeyfield()
  }
  loadAllTickets() {
    this.#loadTickets()
    this.#focusKeyfield()
  }
  performSearch() {
    this.#focusKeyfield()
  }
  queueSearch() {
    this.#searchqueue.next()
  }
  changePage(page: number) {
    this.searchinput().page = page
    this.#searchForOrders()
  }

  #searchForOrders() {
    this.tickets.set(undefined)
    this.ticketsLoading.set(false)
    this.keysearch.set("")

    const filter = this.#generateSearchFilter()
    if (filter == "") {
      this.#loadTickets()
      return
    }

    this.ordersLoading.set(true)
    this.orders.set(undefined)

    this.adminEventCheckinService
      .searchForOrders(this.searchinput().page, filter)
      .subscribe({
        next: (data) => {
          this.ordersLoading.set(false)
          this.orders.set(this.parseOrdersList(data))
          this.#checkKeySearch()
        },
        error: toastErrorHandler(this.toastService, "Søk feilet"),
      })
  }

  private parseOrdersList(data: AdminOrderSearchData) {
    return {
      ...data,
      result: data.result.map((order) => {
        let total_valid = 0
        let total_reserved = 0

        for (const ticket of order.tickets) {
          this.ticketsById[ticket.id] = {
            ...ticket,
            order,
          }

          if (ticket.is_revoked) continue

          if (ticket.is_valid) {
            total_valid += ticket.ticketgroup.price + ticket.ticketgroup.fee
          } else {
            total_reserved += ticket.ticketgroup.price + ticket.ticketgroup.fee
          }
        }

        return {
          ...order,
          total_valid,
          total_reserved,
        }
      }),
    }
  }

  /**
   * Automatically checkin if possible
   */
  #checkKeySearch() {
    this.keyok.set(undefined)
    this.keyticket.set(undefined)

    const orders = this.orders()
    const keysearch = this.keysearch()
    if (orders && keysearch && this.keysearchlast != keysearch) {
      this.keysearchlast = keysearch
      for (const order of orders.result) {
        for (const ticket of order.tickets) {
          if (keysearch == ticket.key) {
            const keyok = ticket.is_valid && !ticket.is_revoked && !ticket.used
            this.keyok.set(keyok)

            const found = {
              ...ticket,
              order,
            }

            this.keyticket.set(found)

            if (keyok) {
              this.checkin(found)
            }
          }
        }
      }
    }
  }

  #generateSearchFilter() {
    const searchinput = this.searchinput()
    const r: string[] = []
    if (searchinput.name) {
      if (/^\d{6}$/.test(searchinput.name)) {
        this.keysearch.set(searchinput.name)
        r.push("tickets.key=" + searchinput.name)
      } else {
        r.push("name:like:" + searchinput.name + "%")
      }
    }

    if (searchinput.id) {
      const x = searchinput.id.length > 8 ? "order_text_id" : "id"
      r.push(x + "=" + searchinput.id)
    }

    for (const x of ["email", "phone"] as const) {
      if (searchinput[x]) {
        r.push(x + ":like:" + searchinput[x] + "%")
      }
    }

    return r.join(",")
  }

  private resetSearchInput() {
    this.keysearch.set("")
    this.keysearchlast = ""
    this.keyok.set(undefined)
    this.keyticket.set(undefined)
    this.searchinput.set(structuredClone(searchinputInit))
  }

  #loadTickets() {
    this.ticketsLoading.set(true)
    this.orders.set(undefined)
    this.ordersLoading.set(false)
    this.resetSearchInput()

    this.adminEventCheckinService.getAllTickets(Number(this.id())).subscribe({
      next: (data) => {
        this.tickets.set(this.parseTicketsList(data))
        this.ticketsLoading.set(false)
      },
      error: toastErrorHandler(
        this.toastService,
        "Feil ved lasting av billetter",
      ),
    })
  }

  private parseTicketsList(tickets: AdminTicketForCheckinData[]) {
    const orders: (AdminTicketForCheckinData["order"] & {
      tickets: AdminTicketForCheckinData[]
    })[] = []
    const ordersById: Record<number, (typeof orders)[0]> = {}
    this.ticketsById = {}

    for (const ticket of tickets) {
      this.ticketsById[ticket.id] = ticket
      if (ticket.order.id in ordersById) {
        ordersById[ticket.order.id].tickets.push(ticket)
      } else {
        const order = {
          ...ticket.order,
          tickets: [ticket],
        }
        ordersById[order.id] = order
        orders.push(order)
      }
    }

    return orders
  }

  #performCheckin(ticket: ApiTicketAdmin, isCheckin: boolean) {
    this.ticketsWorking.update((ids) => [...ids, ticket.id])

    const operation = isCheckin
      ? this.adminEventCheckinService.checkin(ticket.id)
      : this.adminEventCheckinService.checkout(ticket.id)

    operation.subscribe({
      next: (data) => {
        const toUpdate = this.ticketsById[ticket.id] || ticket
        Object.assign(toUpdate, data)
        this.ticketsWorking.update((ids) =>
          ids.filter((id) => id !== ticket.id),
        )

        // event checkin information will be changed, reload it
        this.#reloadEvent()

        // list of last checked in tickets are probably changed, reload it
        this.lastUsedTicketsResource.reload()
      },
      error: toastErrorHandler(
        this.toastService,
        "Innsjekking feilet av ukjent årsak - oppdater siden",
      ),
    })
  }
}
