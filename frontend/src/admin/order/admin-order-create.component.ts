import { Dialog } from "@angular/cdk/dialog"
import { NgClass } from "@angular/common"
import {
  Component,
  computed,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from "@angular/core"
import { rxResource } from "@angular/core/rxjs-interop"
import { FormsModule } from "@angular/forms"
import { Router, RouterLink } from "@angular/router"
import { catchError, firstValueFrom, map, mergeMap, of, tap } from "rxjs"
import { api } from "../../api"
import {
  ApiEventAdmin,
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
import { ToastService } from "../../common/toast.service"
import { AdminEventgroupService } from "../eventgroup/admin-eventgroup.service"
import { AdminPaymentgroupSelectboxComponent } from "../paymentgroup/admin-paymentgroup-selectbox.component"
import { AdminPrinterSelectboxComponent } from "../printer/admin-printer-selectbox.component"
import { AdminPrinterService } from "../printer/admin-printer.service"
import { AdminTicketService } from "../ticket/admin-ticket.service"
import { AdminTicketgroupAddToOrderModal } from "../ticketgroup/admin-ticketgroup-add-to-order-modal.component"
import { AdminOrderGetData, AdminOrderService } from "./admin-order.service"

type OrderDraft = Partial<ApiOrderAdmin> & {
  id?: number
  tickets: (ApiTicketAdmin & {
    event: ApiEventAdmin
    ticketgroup: ApiTicketgroupAdmin
  })[]
}

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
export class AdminOrderCreateComponent {
  private adminEventgroupService = inject(AdminEventgroupService)
  private adminOrderService = inject(AdminOrderService)
  private adminTicketService = inject(AdminTicketService)
  private adminPrinterService = inject(AdminPrinterService)
  private toastService = inject(ToastService)
  private router = inject(Router)
  private dialog = inject(Dialog)

  api = api
  parseFloat = parseFloat

  eventgroupId = input.required<string>()

  usernameInput =
    viewChild.required<ElementRef<HTMLInputElement>>("usernameInput")

  eventgroupResource = rxResource({
    params: () => this.eventgroupId(),
    stream: ({ params }) =>
      this.adminEventgroupService
        .get(params)
        .pipe(tap((eventgroup) => this.#restoreOrder(eventgroup.id))),
  })

  previousOrdersResource = rxResource({
    params: () => this.eventgroupResource.value()?.id,
    stream: ({ params }) =>
      this.adminOrderService
        .query({ filter: `eventgroup_id=${params}&is_admin=1`, limit: 3 })
        .pipe(map((data) => data.result)),
  })

  order = signal<OrderDraft>({ tickets: [] })
  paymentgroup = signal<ApiPaymentgroupAdmin | undefined>(undefined)
  printer = signal<ApiPrinterAdmin | undefined>(undefined)

  ticketgroupsWorking = signal<number[]>([])

  getTotalValid = this.adminOrderService.getTotalValid
  getTotalReserved = this.adminOrderService.getTotalReserved

  #restoreOrder(eventgroupId: number) {
    const newOrderId = localStorage.getItem("billett.neworder.id")
    if (newOrderId) {
      // TODO: loading state
      this.adminOrderService.get(newOrderId).subscribe({
        next: (order) => {
          this.order.set(order)

          if (order.is_valid) {
            localStorage.removeItem("billett.neworder.id")
            void this.router.navigateByUrl(`/a/order/${order.id}`)
          }
        },
        error: () => {
          localStorage.removeItem("billett.neworder.id")
          this.#openAddTickets(eventgroupId)
        },
      })
    } else {
      this.#openAddTickets(eventgroupId)
    }
  }

  private resetOrder() {
    this.order.set({ tickets: [] })
  }

  createBlank() {
    void this.getOrCreateOrder()
  }

  completeOrder() {
    this.saveEdit()
      .pipe(
        mergeMap(() =>
          this.adminOrderService
            .validateAndConvert(
              this.order().id!,
              this.paymentgroup()!,
              this.total(),
            )
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
                void this.getOrCreateOrder(true)
                return of()
              }),
            ),
        ),
      )
      .subscribe()
  }

  saveEdit() {
    return this.adminOrderService.update(this.order() as ApiOrderAdmin).pipe(
      tap((order) => {
        this.order.set(order)
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
      void this.router.navigateByUrl(`/a/order/${this.order().id}`)
    })
  }

  abortOrder() {
    this.adminOrderService.delete(this.order().id!).subscribe({
      next: () => {
        localStorage.removeItem("billett.neworder.id")
        this.resetOrder()
      },
      error: toastErrorHandler(this.toastService, "Feil ved sletting av ordre"),
    })
  }

  private async getOrCreateOrder(reload?: boolean) {
    const current = this.order()
    // if id is set, the order exists already
    if (current.id) {
      if (reload) {
        const order = await firstValueFrom(
          this.adminOrderService.get(String(current.id)),
        )
        this.order.set(order)
        return order
      } else {
        return current
      }
    }

    let order: AdminOrderGetData
    try {
      order = await firstValueFrom(
        this.adminOrderService.create({
          eventgroup_id: this.eventgroupResource.value()!.id,
          name: current.name,
          email: current.email,
          phone: current.phone,
          recruiter: current.recruiter,
          comment: current.comment,
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
    this.order.set(order)
    return order
  }

  ticketgroups = computed(() => {
    const ticketgroups: Record<
      number,
      {
        ticketgroup: ApiTicketgroupAdmin
        event: ApiEventAdmin
        tickets: ApiTicketAdmin[]
        num: number
      }
    > = {}

    for (const ticket of this.order().tickets) {
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
  })

  total = computed(() =>
    this.order().tickets.reduce(
      (acc, ticket) => acc + ticket.ticketgroup.price + ticket.ticketgroup.fee,
      0,
    ),
  )

  deleteTicket({
    ticketgroup,
    tickets,
  }: {
    ticketgroup: ApiTicketgroupAdmin
    tickets: ApiTicketAdmin[]
  }) {
    const done = () =>
      this.ticketgroupsWorking.update((ids) =>
        ids.filter((id) => id !== ticketgroup.id),
      )
    this.ticketgroupsWorking.update((ids) => [...ids, ticketgroup.id])

    this.adminTicketService.delete(tickets[0].id).subscribe({
      next: () => {
        void this.getOrCreateOrder(true).finally(done)
      },
      error: (error) => {
        toastErrorHandler(this.toastService, "Feilet å fjerne billett")(error)
        done()
      },
    })
  }

  addTickets() {
    this.#openAddTickets(this.eventgroupResource.value()!.id)
  }

  #openAddTickets(eventgroupId: number) {
    AdminTicketgroupAddToOrderModal.open(this.dialog, {
      eventgroupId,
      getOrderId: () => this.getOrCreateOrder().then((order) => order.id!),
    }).closed.subscribe((tickets) => {
      if (!tickets) return
      this.getOrCreateOrder(true).then(
        () => {
          this.usernameInput().nativeElement.focus()
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

  private printTickets() {
    const printer = this.printer()
    if (!printer) return

    const list = this.order().tickets.filter(
      (ticket) => ticket.is_valid && !ticket.is_revoked,
    )
    if (list.length == 0) return

    this.adminPrinterService.printTickets(printer, list).subscribe({
      next: () => {
        this.toastService.show("Utskrift lagt i kø", { class: "success" })
      },
      error: toastErrorHandler(this.toastService),
    })
  }
}
