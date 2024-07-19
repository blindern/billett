import { Dialog } from "@angular/cdk/dialog"
import { NgClass } from "@angular/common"
import {
  Component,
  inject,
  Input,
  OnChanges,
  SimpleChanges,
} from "@angular/core"
import { FormsModule } from "@angular/forms"
import { Router, RouterLink } from "@angular/router"
import { catchError, finalize, of, tap } from "rxjs"
import { api } from "../../api"
import { ApiTicketAdmin, ApiTicketgroupAdmin } from "../../apitypes"
import { getValidationError, toastErrorHandler } from "../../common/errors"
import { FormatdatePipe } from "../../common/formatdate.pipe"
import { MarkdownComponent } from "../../common/markdown.component"
import { PagePropertyComponent } from "../../common/page-property.component"
import { PageStatesComponent } from "../../common/page-states.component"
import { PricePipe } from "../../common/price.pipe"
import {
  handleResourceLoadingStates,
  ResourceLoadingState,
} from "../../common/resource-loading"
import { ToastService } from "../../common/toast.service"
import { AdminPaymentCreateModal } from "../payment/admin-payment-create-modal.component"
import { AdminPaymentgroupSelectModal } from "../paymentgroup/admin-paymentgroup-select-modal.component"
import { AdminPrinterSelectModal } from "../printer/admin-printer-select-modal.component"
import { AdminPrinterService } from "../printer/admin-printer.service"
import {
  AdminTicketRevokeModal,
  AdminTicketRevokeModalInput,
} from "../ticket/admin-ticket-revoke-modal.component"
import { AdminTicketService } from "../ticket/admin-ticket.service"
import { AdminTicketgroupAddToOrderModal } from "../ticketgroup/admin-ticketgroup-add-to-order-modal.component"
import { AdminOrderEmailModal } from "./admin-order-email-modal.component"
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
export class AdminOrderItemComponent implements OnChanges {
  private adminOrderService = inject(AdminOrderService)
  private adminTicketService = inject(AdminTicketService)
  private adminPrinterService = inject(AdminPrinterService)
  private toastService = inject(ToastService)
  private router = inject(Router)
  private dialog = inject(Dialog)

  api = api

  @Input()
  id!: string

  pageState = new ResourceLoadingState()
  order?: AdminOrderGetData

  #editFields = ["name", "email", "phone", "recruiter", "comment"] as const
  edit?: AdminOrderGetData

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["id"]) {
      this.adminOrderService
        .get(this.id)
        .pipe(handleResourceLoadingStates(this.pageState))
        .subscribe((data) => {
          this.order = data
        })
    }
  }

  refreshOrder() {
    this.adminOrderService.get(this.id).subscribe({
      next: (data) => {
        this.order = data
      },
      error: toastErrorHandler(this.toastService, "Feil ved henting av ordre"),
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
    for (const field of this.#editFields) {
      this.order![field] = this.edit![field]
    }
    this.adminOrderService.update(this.order!).subscribe({
      next: (order) => {
        this.order = order
        this.edit = undefined
      },
      error: toastErrorHandler(
        this.toastService,
        "Feil ved oppdatering av ordre",
      ),
    })
  }

  deleteReservation() {
    const eventgroupId = this.order!.eventgroup.id
    this.adminOrderService.delete(this.order!.id).subscribe({
      next: () => {
        this.router.navigateByUrl(`/a/orders?eventgroup_id=${eventgroupId}`)
      },
      error: toastErrorHandler(this.toastService, "Feil ved sletting av ordre"),
    })
  }

  completeOrder() {
    AdminPaymentgroupSelectModal.open(this.dialog, {
      eventgroupId: this.order!.eventgroup.id,
      actionText: "Marker som betalt",
      amount: this.totalReserved,
      handler: (paymentgroup) =>
        this.adminOrderService
          .validateAndConvert(this.order!.id, paymentgroup, this.totalReserved)
          .pipe(
            finalize(() => {
              this.refreshOrder()
            }),
            catchError((error) => {
              if (getValidationError(error) === "amount mismatched") {
                this.toastService.show(
                  "Noe i reservasjonen ser ut til å ha endret seg. Prøv på nytt.",
                  {
                    class: "warning",
                  },
                )
              } else {
                toastErrorHandler(this.toastService)(error)
              }
              return of()
            }),
          ),
    })
  }

  convertOrder() {
    this.adminOrderService.validate(this.order!.id).subscribe({
      next: () => {
        this.refreshOrder()
      },
      error: toastErrorHandler(this.toastService),
    })
  }

  addTickets() {
    AdminTicketgroupAddToOrderModal.open(this.dialog, {
      eventgroupId: this.order!.eventgroup.id,
      getOrderId: async () => this.order!.id,
    }).closed.subscribe((tickets) => {
      if (!tickets) return
      this.refreshOrder()
    })
  }

  revokeTicket(ticket: AdminTicketRevokeModalInput["ticket"]) {
    AdminTicketRevokeModal.open(this.dialog, {
      order: this.order!,
      ticket,
    }).closed.subscribe((result) => {
      if (!result) return
      this.refreshOrder()
    })
  }

  validateTicket(
    ticket: ApiTicketAdmin & {
      ticketgroup: ApiTicketgroupAdmin
    },
  ) {
    AdminPaymentgroupSelectModal.open(this.dialog, {
      eventgroupId: this.order!.eventgroup.id,
      actionText: "Inntekstfør",
      amount: ticket.ticketgroup.price + ticket.ticketgroup.fee,
      handler: (paymentgroup) =>
        this.adminTicketService
          .validateAndConvert(ticket.id, paymentgroup)
          .pipe(
            finalize(() => {
              this.refreshOrder()
            }),
            catchError((error) => {
              toastErrorHandler(this.toastService)(error)
              return of()
            }),
          ),
    })
  }

  deleteTicket(ticket: ApiTicketAdmin) {
    this.adminTicketService.delete(ticket.id).subscribe({
      next: () => {
        this.refreshOrder()
      },
      error: (error) => {
        toastErrorHandler(this.toastService)(error)
        this.refreshOrder()
      },
    })
  }

  newPayment() {
    AdminPaymentCreateModal.open(this.dialog, {
      order: this.order!,
    }).closed.subscribe(() => {
      this.refreshOrder()
    })
  }

  sendEmail() {
    AdminOrderEmailModal.open(this.dialog, {
      order: this.order!,
    }).closed.subscribe((sent) => {
      if (!sent) return
      this.toastService.show("E-post ble sendt", { class: "success" })
    })
  }

  printTickets() {
    AdminPrinterSelectModal.open(this.dialog, {
      handler: (printer) =>
        this.adminPrinterService.printTickets(printer, this.validTickets).pipe(
          tap(() => {
            this.toastService.show("Utskrift lagt i kø", {
              class: "success",
            })
          }),
          catchError((e) => {
            this.toastService.show("Ukjent feil oppsto!", {
              class: "warning",
            })
            throw e
          }),
        ),
    })
  }

  printTicket(ticket: ApiTicketAdmin) {
    AdminPrinterSelectModal.open(this.dialog, {
      handler: (printer) => {
        console.log("print!")
        return this.adminPrinterService.printTicket(printer, ticket).pipe(
          tap(() => {
            this.toastService.show("Utskrift lagt i kø", {
              class: "success",
            })
          }),
          catchError((e) => {
            toastErrorHandler(this.toastService)(e)
            throw e
          }),
        )
      },
    })
  }
}
