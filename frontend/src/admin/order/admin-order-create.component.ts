import { Dialog } from "@angular/cdk/dialog"
import { NgClass } from "@angular/common"
import {
  Component,
  ElementRef,
  inject,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from "@angular/core"
import { FormsModule } from "@angular/forms"
import { Router, RouterLink } from "@angular/router"
import { catchError, firstValueFrom, mergeMap, of, tap } from "rxjs"
import { api } from "../../api"
import {
  ApiEventAdmin,
  ApiEventgroupAdmin,
  ApiOrderAdmin,
  ApiPaymentgroupAdmin,
  ApiPrinterAdmin,
  ApiTicketAdmin,
  ApiTicketgroupAdmin,
} from "../../apitypes"
import { getValidationError, toastErrorHandler } from "../../common/errors"
import { FormatdatePipe } from "../../common/formatdate.pipe"
import { PagePropertyComponent } from "../../common/page-property.component"
import { PageStatesComponent } from "../../common/page-states.component"
import { PricePipe } from "../../common/price.pipe"
import {
  handleResourceLoadingStates,
  ResourceLoadingState,
} from "../../common/resource-loading"
import { ToastService } from "../../common/toast.service"
import { AdminEventgroupService } from "../eventgroup/admin-eventgroup.service"
import { AdminPaymentgroupSelectboxComponent } from "../paymentgroup/admin-paymentgroup-selectbox.component"
import { AdminPrinterSelectboxComponent } from "../printer/admin-printer-selectbox.component"
import { AdminPrinterService } from "../printer/admin-printer.service"
import { AdminTicketService } from "../ticket/admin-ticket.service"
import { AdminTicketgroupAddToOrderModal } from "../ticketgroup/admin-ticketgroup-add-to-order-modal.component"
import { AdminOrderGetData, AdminOrderService } from "./admin-order.service"

@Component({
  selector: "billett-admin-order-create",
  standalone: true,
  imports: [
    PageStatesComponent,
    RouterLink,
    PagePropertyComponent,
    NgClass,
    PricePipe,
    FormatdatePipe,
    FormsModule,
    AdminPaymentgroupSelectboxComponent,
    AdminPrinterSelectboxComponent,
  ],
  templateUrl: "./admin-order-create.component.html",
})
export class AdminOrderCreateComponent implements OnInit, OnChanges {
  private adminEventgroupService = inject(AdminEventgroupService)
  private adminOrderService = inject(AdminOrderService)
  private adminTicketService = inject(AdminTicketService)
  private adminPrinterService = inject(AdminPrinterService)
  private toastService = inject(ToastService)
  private router = inject(Router)
  private dialog = inject(Dialog)

  api = api
  parseFloat = parseFloat

  @Input()
  eventgroupId!: string

  @ViewChild("usernameInput")
  usernameInput!: ElementRef<HTMLInputElement>

  pageState = new ResourceLoadingState()
  eventgroup?: ApiEventgroupAdmin
  order: Partial<ApiOrderAdmin> & {
    id?: number
    tickets: (ApiTicketAdmin & {
      event: ApiEventAdmin
      ticketgroup: ApiTicketgroupAdmin
    })[]
  } = {
    tickets: [],
  }
  paymentgroup?: ApiPaymentgroupAdmin
  printer?: ApiPrinterAdmin

  ticketgroupsWorking = new Set<number>()

  previousOrders: (ApiOrderAdmin & {
    tickets: (ApiTicketAdmin & {
      event: ApiEventAdmin
      ticketgroup: ApiTicketgroupAdmin
    })[]
  })[] = []

  getTotalValid = this.adminOrderService.getTotalValid
  getTotalReserved = this.adminOrderService.getTotalReserved

  ngOnInit(): void {
    this.resetOrder()
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["eventgroupId"]) {
      this.adminEventgroupService
        .get(this.eventgroupId)
        .pipe(handleResourceLoadingStates(this.pageState))
        .subscribe((data) => {
          this.eventgroup = data
          this.reloadHistory()

          const newOrderId = localStorage.getItem("billett.neworder.id")
          if (newOrderId) {
            // TODO: loading state
            this.adminOrderService.get(newOrderId).subscribe({
              next: (order) => {
                this.order = order

                if (order.is_valid) {
                  localStorage.removeItem("billett.neworder.id")
                  this.router.navigateByUrl(`/a/order/${order.id}`)
                }
              },
              error: () => {
                localStorage.removeItem("billett.neworder.id")
                this.addTickets()
              },
            })
          } else {
            this.addTickets()
          }
        })
    }
  }

  private resetOrder() {
    this.order = {
      tickets: [],
    }
  }

  createBlank() {
    this.getOrCreateOrder()
  }

  completeOrder() {
    this.saveEdit()
      .pipe(
        mergeMap(() =>
          this.adminOrderService
            .validateAndConvert(this.order.id!, this.paymentgroup!, this.total)
            .pipe(
              tap((order) => {
                this.toastService.show(
                  `Ordren ble vellykket opprettet. <a href="a/order/${order.id}">Vis ordre</a>`,
                  {
                    class: "success",
                    unsafeHtml: true,
                    timeout: 15000,
                  },
                )
                this.printTickets()
                localStorage.removeItem("billett.neworder.id")
                this.resetOrder()
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
                this.getOrCreateOrder(true)
                return of()
              }),
            ),
        ),
      )
      .subscribe()
  }

  saveEdit() {
    return this.adminOrderService.update(this.order as ApiOrderAdmin).pipe(
      tap((order) => {
        this.order = order
      }),
      catchError((error) => {
        toastErrorHandler(
          this.toastService,
          "Feil ved lagring av endringer",
        )(error)
        return of()
      }),
    )
  }

  saveOrder() {
    this.saveEdit().subscribe(() => {
      localStorage.removeItem("billett.neworder.id")
      this.router.navigateByUrl(`/a/order/${this.order.id}`)
    })
  }

  abortOrder() {
    this.adminOrderService.delete(this.order.id!).subscribe({
      next: () => {
        localStorage.removeItem("billett.neworder.id")
        this.resetOrder()
      },
      error: toastErrorHandler(this.toastService, "Feil ved sletting av ordre"),
    })
  }

  private async getOrCreateOrder(reload?: boolean) {
    // if id is set, the order exists already
    if (this.order?.id) {
      if (reload) {
        const order = await firstValueFrom(
          this.adminOrderService.get(String(this.order.id)),
        )
        this.order = order
        return order
      } else {
        return this.order
      }
    }

    let order: AdminOrderGetData
    try {
      order = await firstValueFrom(
        this.adminOrderService.create({
          eventgroup_id: this.eventgroup!.id,
          name: this.order?.name,
          email: this.order?.email,
          phone: this.order?.phone,
          recruiter: this.order?.recruiter,
          comment: this.order?.comment,
        }),
      )
    } catch (error: unknown) {
      toastErrorHandler(
        this.toastService,
        "Feil oppsto ved opprettelse av ordre",
      )(error)
      throw error
    }

    localStorage.setItem("billett.neworder.id", String(order.id))
    this.order = order
    return order
  }

  get ticketgroups() {
    const ticketgroups: Record<
      number,
      {
        ticketgroup: ApiTicketgroupAdmin
        event: ApiEventAdmin
        tickets: ApiTicketAdmin[]
        num: number
      }
    > = {}

    for (const ticket of this.order.tickets) {
      let ticketgroup = ticketgroups[ticket.ticketgroup.id]
      if (!ticketgroup) {
        ticketgroup = {
          ticketgroup: ticket.ticketgroup,
          event: ticket.event,
          tickets: [],
          num: 0,
        }
        ticketgroups[ticket.ticketgroup.id] = ticketgroup
      }

      ticketgroup.num++
      ticketgroup.tickets.push(ticket)
    }

    return Object.values(ticketgroups).sort(
      (a, b) => a.event.time_start - b.event.time_start,
    )
  }

  get total() {
    return this.order.tickets.reduce(
      (acc, ticket) => acc + ticket.ticketgroup.price + ticket.ticketgroup.fee,
      0,
    )
  }

  deleteTicket({
    ticketgroup,
    tickets,
  }: {
    ticketgroup: ApiTicketgroupAdmin
    tickets: ApiTicketAdmin[]
  }) {
    this.ticketgroupsWorking.add(ticketgroup.id)

    this.adminTicketService.delete(tickets[0].id).subscribe({
      next: () => {
        this.getOrCreateOrder(true).finally(() => {
          this.ticketgroupsWorking.delete(ticketgroup.id)
        })
      },
      error: (error) => {
        toastErrorHandler(this.toastService, "Feilet å fjerne billett")(error)
        this.ticketgroupsWorking.delete(ticketgroup.id)
      },
    })
  }

  addTickets() {
    AdminTicketgroupAddToOrderModal.open(this.dialog, {
      eventgroupId: this.eventgroup!.id,
      getOrderId: () => this.getOrCreateOrder().then((order) => order.id!),
    }).closed.subscribe((tickets) => {
      if (!tickets) return
      this.getOrCreateOrder(true).then(
        () => {
          this.usernameInput.nativeElement.focus()
        },
        (error) => {
          toastErrorHandler(
            this.toastService,
            "Ukjent feil oppsto ved forsøk på å laste ordren på nytt",
          )(error)
        },
      )
    })
  }

  private reloadHistory() {
    this.adminOrderService
      .query({
        filter: `eventgroup_id=${this.eventgroup!.id}&is_admin=1`,
        limit: 3,
      })
      .subscribe({
        next: (data) => {
          this.previousOrders = data.result
        },
        error: toastErrorHandler(this.toastService, "Feilet å hente historikk"),
      })
  }

  private printTickets() {
    if (!this.printer) return

    const list = this.order.tickets.filter(
      (ticket) => ticket.is_valid && !ticket.is_revoked,
    )
    if (list.length == 0) return

    this.adminPrinterService.printTickets(this.printer, list).subscribe({
      next: () => {
        this.toastService.show("Utskrift lagt i kø", { class: "success" })
      },
      error: toastErrorHandler(this.toastService),
    })
  }
}
