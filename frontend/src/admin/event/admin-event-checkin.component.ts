import { CommonModule } from "@angular/common"
import {
  Component,
  inject,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from "@angular/core"
import { FormsModule } from "@angular/forms"
import { RouterLink } from "@angular/router"
import { debounceTime, Subject } from "rxjs"
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
import {
  handleResourceLoadingStates,
  ResourceLoadingState,
} from "../../common/resource-loading"
import { ToastService } from "../../common/toast.service"
import {
  AdminEventCheckinService,
  AdminOrderSearchData,
  AdminTicketForCheckinData,
} from "./admin-event-checkin.service"
import { AdminEventFormComponent } from "./admin-event-form.component"
import { AdminEventData, AdminEventService } from "./admin-event.service"

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
    AdminEventFormComponent,
    FormatdatePipe,
    PricePipe,
    CommonModule,
    FormsModule,
    PaginationComponent,
  ],
  templateUrl: "./admin-event-checkin.component.html",
  styleUrl: "./admin-event-checkin.component.scss",
})
export class AdminEventCheckinComponent implements OnInit, OnChanges {
  private adminEventService = inject(AdminEventService)
  private adminEventCheckinService = inject(AdminEventCheckinService)
  private toastService = inject(ToastService)

  @Input()
  id!: string

  api = api
  parseFloat = parseFloat

  pageState = new ResourceLoadingState()
  event?: AdminEventData

  tickets?: ReturnType<AdminEventCheckinComponent["parseTicketsList"]>
  ticketsLoading = false
  ticketsById: Record<number, Omit<Ticket, "event">> = {}

  ticketsWorking = new Set<number>()

  lastUsedTickets?: AdminTicketForCheckinData[]
  lastUsedTicketsLoading = false

  keysearch = ""
  keysearchlast = ""
  keyticket?: Ticket
  keyok?: boolean

  ordersLoading = false
  orders?: ReturnType<AdminEventCheckinComponent["parseOrdersList"]>

  searchinput = structuredClone(searchinputInit)

  #searchqueue = new Subject()

  ngOnInit(): void {
    this.#searchqueue.pipe(debounceTime(300)).subscribe(() => {
      if (this.searchinput.page !== 1) {
        this.searchinput.page = 1
        return
      }

      if (this.event) this.#searchForOrders()
      if (this.keysearch) this.#focusKeyfield()
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["id"]) {
      this.adminEventService
        .get(this.id)
        .pipe(handleResourceLoadingStates(this.pageState))
        .subscribe((data) => {
          this.event = data
          this.#loadTickets()
          this.#loadLastUsedTickets()
        })
    }
  }

  #reloadEvent() {
    this.adminEventService.get(this.id).subscribe({
      next: (data) => {
        this.event = data
      },
      error: toastErrorHandler(
        this.toastService,
        "Kunne ikke laste arrangement",
      ),
    })
  }

  #focusKeyfield() {
    const input = document.querySelector("#keyfield")! as HTMLInputElement
    input.focus()
  }

  checkin(ticket: ApiTicketAdmin) {
    this.#performCheckin(ticket, true)
    this.#focusKeyfield()
  }
  checkout(ticket: ApiTicketAdmin) {
    this.keyok = undefined
    this.keyticket = undefined
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
    this.#searchqueue.next(null)
  }

  #searchForOrders() {
    this.tickets = undefined
    this.ticketsLoading = false
    this.keysearch = ""

    const filter = this.#generateSearchFilter()
    if (filter == "") {
      if (!this.ticketsLoading) this.#loadTickets()
      return
    }

    this.ordersLoading = true
    this.orders = undefined

    this.adminEventCheckinService
      .searchForOrders(this.searchinput.page, filter)
      .subscribe({
        next: (data) => {
          this.ordersLoading = false
          this.orders = this.parseOrdersList(data)
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
    this.keyok = undefined
    this.keyticket = undefined

    if (this.orders && this.keysearch && this.keysearchlast != this.keysearch) {
      this.keysearchlast = this.keysearch
      for (const order of this.orders.result) {
        for (const ticket of order.tickets) {
          if (this.keysearch == ticket.key) {
            this.keyok = ticket.is_valid && !ticket.is_revoked && !ticket.used

            const found = {
              ...ticket,
              order,
            }

            this.keyticket = found

            if (this.keyok) {
              this.checkin(found)
            }
          }
        }
      }
    }
  }

  #generateSearchFilter() {
    const r: string[] = []
    if (this.searchinput.name) {
      if (/^\d{6}$/.test(this.searchinput.name)) {
        this.keysearch = this.searchinput.name
        r.push("tickets.key=" + this.searchinput.name)
      } else {
        r.push("name:like:" + this.searchinput.name + "%")
      }
    }

    if (this.searchinput.id) {
      const x = this.searchinput.id.length > 8 ? "order_text_id" : "id"
      r.push(x + "=" + this.searchinput.id)
    }

    for (const x of ["email", "phone"] as const) {
      if (this.searchinput[x]) {
        r.push(x + ":like:" + this.searchinput[x] + "%")
      }
    }

    return r.join(",")
  }

  private resetSearchInput() {
    this.keysearch = ""
    this.keysearchlast = ""
    this.keyok = undefined
    this.keyticket = undefined
    this.searchinput = structuredClone(searchinputInit)
  }

  #loadTickets() {
    this.ticketsLoading = true
    this.orders = undefined
    this.ordersLoading = false
    this.resetSearchInput()

    this.adminEventCheckinService.getAllTickets(this.event!.id).subscribe({
      next: (data) => {
        this.tickets = this.parseTicketsList(data)
        this.ticketsLoading = false
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

  #loadLastUsedTickets() {
    this.lastUsedTicketsLoading = true
    this.adminEventCheckinService.getLastUsedTickets(this.event!.id).subscribe({
      next: (data) => {
        console.log(data)
        this.lastUsedTicketsLoading = false
        this.lastUsedTickets = data.result
      },
      error: toastErrorHandler(
        this.toastService,
        "Feil ved lasting av siste innsjekkede billetter",
      ),
    })
  }

  #performCheckin(ticket: ApiTicketAdmin, isCheckin: boolean) {
    this.ticketsWorking.add(ticket.id)

    const operation = isCheckin
      ? this.adminEventCheckinService.checkin(ticket.id)
      : this.adminEventCheckinService.checkout(ticket.id)

    operation.subscribe({
      next: (data) => {
        this.ticketsWorking.delete(ticket.id)
        const toUpdate = this.ticketsById[ticket.id] || ticket
        Object.assign(toUpdate, data)

        // event checkin information will be changed, reload it
        this.#reloadEvent()

        // list of last checked in tickets are probably changed, reload it
        this.#loadLastUsedTickets()
      },
      error: toastErrorHandler(
        this.toastService,
        "Innsjekking feilet av ukjent årsak - oppdater siden",
      ),
    })
  }
}
