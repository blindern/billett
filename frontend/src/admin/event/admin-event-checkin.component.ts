import { CommonModule } from "@angular/common"
import { Component, Input, OnInit } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { Router, RouterLink } from "@angular/router"
import { debounceTime, Subject } from "rxjs"
import { api } from "../../api"
import { FormatdatePipe } from "../../common/formatdate.pipe"
import { PagePropertyComponent } from "../../common/page-property.component"
import { PageStatesComponent } from "../../common/page-states.component"
import { PageService } from "../../common/page.service"
import { PaginationComponent } from "../../common/pagination.component"
import { PricePipe } from "../../common/price.pipe"
import {
  handleResourceLoadingStates,
  ResourceLoadingState,
} from "../../common/resource-loading"
import {
  AdminEventCheckinService,
  AdminOrderSearchData,
  AdminTicketForCheckinData,
} from "./admin-event-checkin.service"
import { AdminEventFormComponent } from "./admin-event-form.component"
import { AdminEventData, AdminEventService } from "./admin-event.service"

const searchinputInit = {
  page: 1,
  name: "",
  email: "",
  phone: "",
  id: "",
}

@Component({
  selector: "admin-event-checkin",
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
})
export class AdminEventCheckinComponent implements OnInit {
  @Input()
  id!: string

  api = api

  pageState = new ResourceLoadingState()
  event?: AdminEventData

  tickets?: AdminTicketForCheckinData[]
  ticketsLoading = false
  ticketLinks = {}

  lastUsedTickets?: AdminTicketForCheckinData[]
  lastUsedTicketsLoading = false

  keysearch: any
  keysearchlast: any
  keyticket: any
  keyok: any

  ordersLoading: any
  orders?: ReturnType<AdminEventCheckinComponent["parseOrdersList"]>

  searchinput = structuredClone(searchinputInit)

  #searchqueue = new Subject()

  constructor(
    private adminEventService: AdminEventService,
    private pageService: PageService,
    private router: Router,
    private checkinService: AdminEventCheckinService,
  ) {}

  ngOnInit(): void {
    this.pageService.set("title", "Innsjekking av billetter")

    this.adminEventService
      .get(this.id)
      .pipe(handleResourceLoadingStates(this.pageState))
      .subscribe((data) => {
        this.event = data
        this.#loadTickets()
        this.#loadLastUsedTickets()
      })

    this.#searchqueue.pipe(debounceTime(300)).subscribe(() => {
      if (this.searchinput.page !== 1) {
        this.searchinput.page = 1
        return
      }

      if (this.event) this.#searchForOrders()
      if (this.keysearch) this.#focusKeyfield()
    })
  }

  #reloadEvent() {
    this.adminEventService.get(this.id).subscribe((data) => {
      this.event = data
    })
  }

  #focusKeyfield() {
    const input = document.querySelector("#keyfield")! as HTMLInputElement
    input.focus()
  }

  checkin(ticket) {
    this.#performCheckin(ticket, true)
    this.#focusKeyfield()
  }
  checkout(ticket) {
    this.keyok = null
    this.keyticket = null
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
    this.keysearch = null

    var filter = this.#generateSearchFilter()
    if (filter == "") {
      if (!this.ticketsLoading) this.#loadTickets()
      return
    }

    this.ordersLoading = true
    this.orders = undefined

    this.checkinService
      .searchForOrders(this.searchinput.page, filter)
      .subscribe((data) => {
        this.ordersLoading = false
        this.orders = this.parseOrdersList(data)
        this.#checkKeySearch()
      })
  }

  private parseOrdersList(data: AdminOrderSearchData) {
    return {
      ...data,
      result: data.result.map((order) => {
        let total_valid = 0
        let total_reserved = 0

        for (const ticket of order.tickets) {
          this.ticketLinks[ticket.id] = ticket

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
    this.keyok = null
    this.keyticket = null

    if (this.orders && this.keysearch && this.keysearchlast != this.keysearch) {
      this.keysearchlast = this.keysearch
      this.orders.result.forEach((order) => {
        order.tickets.forEach((ticket) => {
          if (this.keysearch == ticket.key) {
            this.keyok = ticket.is_valid && !ticket.is_revoked && !ticket.used
            this.keyticket = ticket

            if (this.keyok) {
              this.checkin(ticket)
            }
          }
        })
      })
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
      var x = this.searchinput.id.length > 8 ? "order_text_id" : "id"
      r.push(x + "=" + this.searchinput.id)
    }

    ;["email", "phone"].forEach((x) => {
      if (this.searchinput[x]) {
        r.push(x + ":like:" + this.searchinput[x] + "%")
      }
    })

    return r.join(",")
  }

  private resetSearchInput() {
    this.keysearch = null
    this.keysearchlast = null
    this.keyok = null
    this.keyticket = null
    this.searchinput = structuredClone(searchinputInit)
  }

  #loadTickets() {
    this.ticketsLoading = true
    this.orders = undefined
    this.ordersLoading = false
    this.resetSearchInput()

    this.checkinService.getAllTickets(this.event!.id).subscribe((data) => {
      this.tickets = this.#parseTicketsList(data)
      this.ticketsLoading = false
    })
  }

  #parseTicketsList(list: AdminTicketForCheckinData[]) {
    const orders: any[] = []
    const orders_link = {}
    this.ticketLinks = {}

    list.forEach((row) => {
      this.ticketLinks[row.id] = row
      if (row.order.id in orders_link) {
        orders_link[row.order.id].tickets.push(row)
      } else {
        const order = row.order
        orders_link[order.id] = order
        orders.push(order)

        order.tickets = [row]
      }
    })

    return orders
  }

  #loadLastUsedTickets() {
    this.lastUsedTicketsLoading = true
    this.checkinService.getLastUsedTickets(this.event!.id).subscribe({
      next: (data) => {
        console.log(data)
        this.lastUsedTicketsLoading = false
        this.lastUsedTickets = data.result
      },
      error: (err) => {
        console.warn(err)
        alert("Ukjent feil ved lasting av siste innsjekkede billetter")
      },
    })
  }

  #performCheckin(ticket: any, isCheckin: boolean) {
    ticket.isWorking = true

    const operation = isCheckin
      ? this.checkinService.checkin(ticket.id)
      : this.checkinService.checkout(ticket.id)

    operation.subscribe({
      next: (data) => {
        const newTicket = data
        delete ticket.isWorking
        newTicket.event = ticket.event
        newTicket.ticketgroup = ticket.ticketgroup
        ticket = this.ticketLinks[ticket.id] || ticket
        Object.assign(ticket, newTicket)

        // event checkin information will be changed, reload it
        this.#reloadEvent()

        // list of last checked in tickets are probably changed, reload it
        this.#loadLastUsedTickets()
      },
      error: () => {
        alert("Innsjekking feilet av ukjent årsak - oppdater siden")
      },
    })
  }
}
