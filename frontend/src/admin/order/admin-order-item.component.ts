import { NgClass } from "@angular/common"
import { Component, inject, Input, OnInit } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { Router, RouterLink } from "@angular/router"
import { catchError, tap } from "rxjs"
import { api } from "../../api"
import { ApiTicketAdmin, ApiTicketgroupAdmin } from "../../apitypes"
import { FormatdatePipe } from "../../common/formatdate.pipe"
import { MarkdownComponent } from "../../common/markdown.component"
import { PagePropertyComponent } from "../../common/page-property.component"
import { PageStatesComponent } from "../../common/page-states.component"
import { PageService } from "../../common/page.service"
import { PricePipe } from "../../common/price.pipe"
import {
  handleResourceLoadingStates,
  ResourceLoadingState,
} from "../../common/resource-loading"
import { AdminPaymentService } from "../payment/admin-payment.service"
import { AdminPaymentgroupService } from "../paymentgroup/admin-paymentgroup.service"
import { AdminPrinterService } from "../printer/admin-printer.service"
import { AdminTicketRevokeModalInput } from "../ticket/admin-ticket-revoke-modal.component"
import { AdminTicketService } from "../ticket/admin-ticket.service"
import { AdminTicketgroupService } from "../ticketgroup/admin-ticketgroup.service"
import { AdminOrderGetData, AdminOrderService } from "./admin-order.service"

@Component({
  selector: "billett-admin-order-item",
  standalone: true,
  imports: [
    PageStatesComponent,
    PagePropertyComponent,
    RouterLink,
    FormsModule,
    PricePipe,
    FormatdatePipe,
    NgClass,
    MarkdownComponent,
  ],
  templateUrl: "./admin-order-item.component.html",
})
export class AdminOrderItemComponent implements OnInit {
  private adminOrderService = inject(AdminOrderService)
  private adminPaymentgroupService = inject(AdminPaymentgroupService)
  private adminTicketgroupService = inject(AdminTicketgroupService)
  private adminTicketService = inject(AdminTicketService)
  private adminPaymentService = inject(AdminPaymentService)
  private adminPrinterService = inject(AdminPrinterService)
  private pageService = inject(PageService)
  private router = inject(Router)

  api = api

  @Input()
  id!: string

  pageState = new ResourceLoadingState()
  order?: AdminOrderGetData

  #editFields = ["name", "email", "phone", "recruiter", "comment"]
  edit?: AdminOrderGetData

  ngOnInit(): void {
    this.pageService.set("title", "Ordre")

    this.adminOrderService
      .get(this.id)
      .pipe(handleResourceLoadingStates(this.pageState))
      .subscribe((data) => {
        this.order = data
      })
  }

  refreshOrder() {
    this.adminOrderService.get(this.id).subscribe((data) => {
      this.order = data
    })
  }

  get balance() {
    return Number(this.order!.balance)
  }

  get totalValid() {
    return this.adminOrderService.getTotalValid(this.order!)
  }

  get totalReserved() {
    return this.adminOrderService.getTotalReserved(this.order!)
  }

  get countReserved() {
    return this.order!.tickets.reduce(
      (acc, ticket) => acc + (!ticket.is_valid ? 1 : 0),
      0,
    )
  }

  get countValid() {
    return this.order!.tickets.reduce(
      (acc, ticket) => acc + (ticket.is_valid && !ticket.is_revoked ? 1 : 0),
      0,
    )
  }

  get countRevoked() {
    return this.order!.tickets.reduce(
      (acc, ticket) => acc + (ticket.is_valid && ticket.is_revoked ? 1 : 0),
      0,
    )
  }

  get validTickets() {
    return this.order!.tickets.filter(
      (ticket) => ticket.is_valid && !ticket.is_revoked,
    )
  }

  get totalPaid() {
    return this.order!.payments.reduce(
      (acc, payment) => acc + Number(payment.amount),
      0,
    )
  }

  get downloadTicketsUrl() {
    const ids = this.validTickets.map((ticket) => ticket.id).join(",")
    return api(`ticket/pdf?ids=${ids}`)
  }

  startEdit() {
    this.edit = this.order
  }

  abortEdit() {
    this.edit = undefined
  }

  save() {
    this.#editFields.forEach((field) => {
      this.order![field] = this.edit![field]
    })
    this.adminOrderService.update(this.order!).subscribe((order) => {
      this.order = order
      this.edit = undefined
    })
  }

  deleteReservation() {
    const eventgroupId = this.order!.eventgroup.id
    this.adminOrderService.delete(this.order!.id).subscribe({
      next: () => {
        this.router.navigateByUrl(`/a/orders?eventgroup_id=${eventgroupId}`)
      },
      error: (err) => {
        console.error(err)
        alert("Feil ved sletting av ordre")
      },
    })
  }

  completeOrder() {
    this.adminPaymentgroupService
      .openSelectModal({
        eventgroupId: this.order!.eventgroup.id,
        actionText: "Marker som betalt",
        amount: this.totalReserved,
      })
      .closed.subscribe((paymentgroup) => {
        if (!paymentgroup) return

        this.adminOrderService
          .validateAndConvert(this.order!.id, paymentgroup, this.totalReserved)
          .subscribe({
            next: (order) => {
              this.refreshOrder()
            },
            error: (err) => {
              // TODO(migrate): response body error handling
              // if (err.data == "amount mismatched") {
              //   alert(
              //     "Noe i reservasjonen ser ut til å ha endret seg. Prøv på nytt.",
              //   )
              //   this.getOrCreateOrder(true)
              // } else {
              console.error(err)
              alert(err.data)
              this.refreshOrder()
              // }
            },
          })
      })
  }

  convertOrder() {
    this.adminOrderService.validate(this.order!.id).subscribe({
      next: () => {
        this.refreshOrder()
      },
    })
  }

  addTickets() {
    this.adminTicketgroupService
      .openAddTicketsModal({
        eventgroupId: this.order!.eventgroup.id,
        getOrderId: async () => this.order!.id,
      })
      .closed.subscribe((tickets) => {
        if (!tickets) return
        this.refreshOrder()
      })
  }

  revokeTicket(ticket: AdminTicketRevokeModalInput["ticket"]) {
    this.adminTicketService
      .openRevokeModal({
        order: this.order!,
        ticket,
      })
      .closed.subscribe((result) => {
        if (!result) return
        this.refreshOrder()
      })
  }

  validateTicket(
    ticket: ApiTicketAdmin & {
      ticketgroup: ApiTicketgroupAdmin
    },
  ) {
    this.adminPaymentgroupService
      .openSelectModal({
        eventgroupId: this.order!.eventgroup.id,
        actionText: "Inntekstfør",
        amount: ticket.ticketgroup.price + ticket.ticketgroup.fee,
      })
      .closed.subscribe((paymentgroup) => {
        if (!paymentgroup) return

        this.adminTicketService
          .validateAndConvert(ticket.id, paymentgroup)
          .subscribe(() => {
            this.refreshOrder()
          })
      })
  }

  deleteTicket(ticket: ApiTicketAdmin) {
    this.adminTicketService.delete(ticket.id).subscribe({
      next: () => {
        this.refreshOrder()
      },
      error: () => {
        this.refreshOrder()
      },
    })
  }

  newPayment() {
    this.adminPaymentService
      .openCreateModal({
        order: this.order!,
      })
      .closed.subscribe(() => {
        this.refreshOrder()
      })
  }

  sendEmail() {
    this.adminOrderService
      .openEmailModal({
        order: this.order!,
      })
      .closed.subscribe((sent) => {
        if (!sent) return
        this.pageService.toast("E-post ble sendt", { class: "success" })
      })
  }

  printTickets() {
    this.adminPrinterService.openPrinterSelectModal({
      handler: (printer) =>
        this.adminPrinterService.printTickets(printer, this.validTickets).pipe(
          tap(() => {
            this.pageService.toast("Utskrift lagt i kø", {
              class: "success",
            })
          }),
          catchError((e) => {
            this.pageService.toast("Ukjent feil oppsto!", {
              class: "warning",
            })
            throw e
          }),
        ),
    })
  }

  printTicket(ticket: ApiTicketAdmin) {
    this.adminPrinterService.openPrinterSelectModal({
      handler: (printer) => {
        console.log("print!")
        return this.adminPrinterService.printTicket(printer, ticket).pipe(
          tap(() => {
            this.pageService.toast("Utskrift lagt i kø", {
              class: "success",
            })
          }),
          catchError((e) => {
            this.pageService.toast("Ukjent feil oppsto!", {
              class: "warning",
            })
            throw e
          }),
        )
      },
    })
  }
}
