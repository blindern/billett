import { Dialog, DialogModule } from "@angular/cdk/dialog"
import { NgClass } from "@angular/common"
import { Component, inject, Input, OnInit } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { RouterLink } from "@angular/router"
import { ApiOrderAdmin, ApiPaymentsourceAdmin } from "../../apitypes"
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
import {
  AdminPaymentgroupData,
  AdminPaymentgroupService,
} from "./admin-paymentgroup.service"
import {
  AdminPaymentsourceCreateModal,
  AdminPaymentsourceCreateModalInput,
  AdminPaymentsourceCreateModalResult,
} from "./admin-paymentsource-create-modal.component"
import { AdminPaymentsourceService } from "./admin-paymentsource.service"

@Component({
  selector: "billett-admin-paymentgroup-item",
  standalone: true,
  imports: [
    PagePropertyComponent,
    RouterLink,
    PageStatesComponent,
    FormatdatePipe,
    FormsModule,
    PricePipe,
    NgClass,
    MarkdownComponent,
    DialogModule,
  ],
  templateUrl: "./admin-paymentgroup-item.component.html",
})
export class AdminPaymentgroupItemComponent implements OnInit {
  private pageService = inject(PageService)
  private adminPaymentgroupService = inject(AdminPaymentgroupService)
  private adminPaymentsourceService = inject(AdminPaymentsourceService)
  private dialog = inject(Dialog)

  @Input()
  id!: string

  // note:
  // payments are registered as debet, so a payment for 100 means 100, while -100 means refund
  // tickets are registered as kredit, so a sale for 30 means -30, while 30 means revoked ticket

  pageState = new ResourceLoadingState()

  paymentgroup?: AdminPaymentgroupData
  derived?: ReturnType<AdminPaymentgroupItemComponent["deriveData"]>

  show_details = false

  edit?: {
    title: string
    description: string | null
  }

  // isolate orders not in balance (only looking at this paymentgroup, not the real balance of the order)
  orders_inbalance: ApiOrderAdmin[] = []

  private refresh() {
    this.adminPaymentgroupService.get(this.id).subscribe((paymentgroup) => {
      this.paymentgroup = paymentgroup
      this.derived = this.deriveData(paymentgroup)
    })
  }

  ngOnInit(): void {
    this.adminPaymentgroupService
      .get(this.id)
      .pipe(handleResourceLoadingStates(this.pageState))
      .subscribe((paymentgroup) => {
        this.paymentgroup = paymentgroup
        this.derived = this.deriveData(paymentgroup)
      })
  }

  #deriveEvents(paymentgroup: AdminPaymentgroupData) {
    const eventStats = new Map<
      number,
      {
        paymentgroupBalance: number
        paymentgroupCount: number
      }
    >()
    const ticketgroupStats = new Map<
      number,
      {
        paymentgroupBalance: number
        paymentgroupCount: number
      }
    >()

    const allTickets = [
      ...paymentgroup.valid_tickets.map((it) => ({
        type: "valid" as const,
        ticket: it,
      })),
      ...paymentgroup.revoked_tickets.map((it) => ({
        type: "revoked" as const,
        ticket: it,
      })),
    ]

    for (const { ticket } of allTickets) {
      if (!eventStats.has(ticket.event.id)) {
        eventStats.set(ticket.event.id, {
          paymentgroupBalance: 0,
          paymentgroupCount: 0,
        })
      }

      if (!ticketgroupStats.has(ticket.ticketgroup.id)) {
        ticketgroupStats.set(ticket.ticketgroup.id, {
          paymentgroupBalance: 0,
          paymentgroupCount: 0,
        })
      }
    }

    for (const { type, ticket } of allTickets) {
      const event = eventStats.get(ticket.event.id)!
      const ticketgroup = ticketgroupStats.get(ticket.ticketgroup.id)!

      const total = ticket.ticketgroup.price + ticket.ticketgroup.fee
      const modifier = type === "valid" ? -1 : 1

      event.paymentgroupBalance += total * modifier
      event.paymentgroupCount += modifier
      ticketgroup.paymentgroupBalance += total * modifier
      ticketgroup.paymentgroupCount += modifier
    }

    return {
      eventStats,
      ticketgroupStats,
    }
  }

  #deriveOrderStats(paymentgroup: AdminPaymentgroupData) {
    const orderStats = new Map<
      number,
      {
        ticket_sales: number
        ticket_revoked: number
        payments: number
        refunds: number
        total: number
      }
    >()

    function addStats(orderId: number, value: number, is_payment: boolean) {
      let item = orderStats.get(orderId)
      if (!item) {
        item = {
          ticket_sales: 0,
          ticket_revoked: 0,
          payments: 0,
          refunds: 0,
          total: 0,
        }
        orderStats.set(orderId, item)
      }

      const t = is_payment
        ? value >= 0
          ? "payments"
          : "refunds"
        : value >= 0
          ? "ticket_revoked"
          : "ticket_sales"

      item[t] += value
      item["total"] += value
    }

    for (const payment of paymentgroup.payments) {
      addStats(payment.order.id, Number(payment.amount), true)
    }

    for (const ticket of paymentgroup.valid_tickets) {
      addStats(
        ticket.order.id,
        -ticket.ticketgroup.price - ticket.ticketgroup.fee,
        false,
      )
    }

    for (const ticket of paymentgroup.revoked_tickets) {
      addStats(
        ticket.order.id,
        ticket.ticketgroup.price + ticket.ticketgroup.fee,
        false,
      )
    }

    return orderStats
  }

  #deriveCategoryTotals(
    paymentgroup: AdminPaymentgroupData,
    eventStats: Map<number, { paymentgroupBalance: number }>,
  ) {
    const eventsById = Object.fromEntries(
      [...paymentgroup.valid_tickets, ...paymentgroup.revoked_tickets].map(
        (it) => [it.event.id, it.event],
      ),
    )

    const categoryTotals = new Map<string, number>()

    for (const event of Object.values(eventsById)) {
      const category = event.category ?? ""

      categoryTotals.set(
        category,
        (categoryTotals.get(category) ?? 0) +
          eventStats.get(event.id)!.paymentgroupBalance,
      )
    }

    return categoryTotals
  }

  private deriveData(paymentgroup: AdminPaymentgroupData) {
    const orderStats = this.#deriveOrderStats(paymentgroup)

    const { eventStats, ticketgroupStats } = this.#deriveEvents(paymentgroup)

    const events = Object.values(
      Object.fromEntries(
        [...paymentgroup.valid_tickets, ...paymentgroup.revoked_tickets].map(
          (it) => [it.event.id, it.event],
        ),
      ),
    ).sort((a, b) => a.time_start - b.time_start)

    const eventsByCategory = Map.groupBy(events, (it) => it.category ?? "")

    const categoryTotals = this.#deriveCategoryTotals(paymentgroup, eventStats)

    return {
      totals: {
        payments: paymentgroup.payments.reduce(
          (acc, payment) => acc + Number(payment.amount),
          0,
        ),
        valid: paymentgroup.valid_tickets.reduce(
          (acc, ticket) =>
            acc - ticket.ticketgroup.price - ticket.ticketgroup.fee,
          0,
        ),
        revoked: paymentgroup.revoked_tickets.reduce(
          (acc, ticket) =>
            acc + ticket.ticketgroup.price + ticket.ticketgroup.fee,
          0,
        ),
      },
      orderStats,
      eventStats,
      ticketgroupStats,
      categories: Array.from(eventsByCategory.entries(), ([name, events]) => ({
        name,
        total: categoryTotals.get(name) ?? 0,
        events: events.map((event) => ({
          ...event,
          ticketgroups: event.ticketgroups.filter((ticketgroup) =>
            ticketgroupStats.get(ticketgroup.id)
              ? ticketgroupStats.get(ticketgroup.id)!.paymentgroupBalance !== 0
              : false,
          ),
        })),
      })).sort((a, b) => a.name.localeCompare(b.name)),
      orders_inbalance: Object.values(
        Object.fromEntries(
          [
            ...paymentgroup.payments.map((it) => it.order),
            ...paymentgroup.valid_tickets.map((it) => it.order),
            ...paymentgroup.revoked_tickets.map((it) => it.order),
          ].map((it) => [it.id, it]),
        ),
      )
        .filter((it) => orderStats.get(it.id)!.total !== 0)
        .sort((a, b) => a.time - b.time),
      ps: this.derivePaymentsources(paymentgroup),
    }
  }

  startEdit() {
    this.edit = {
      title: this.paymentgroup!.title,
      description: this.paymentgroup!.description,
    }
  }

  abortEdit() {
    this.edit = undefined
  }

  save() {
    this.adminPaymentgroupService
      .update({
        id: this.paymentgroup!.id,
        title: this.edit!.title,
        description: this.edit!.description,
      })
      .subscribe((data) => {
        // TODO(migrate): check type
        console.log("response", data)
        this.paymentgroup!.title = this.edit!.title
        this.paymentgroup!.description = this.edit!.description
        this.edit = undefined
      })
  }

  close() {
    if (
      !this.paymentgroup!.time_end &&
      confirm(
        "Er du sikker på at du vil lukke betalingsgruppen? Dette gjøres kun ved oppgjør av økonomi. Kontroller evt. avvik først. Handlingen kan ikke angres.",
      )
    ) {
      this.adminPaymentgroupService
        .close(this.paymentgroup!.id)
        .subscribe(() => {
          this.refresh()
        })
    }
  }

  openCreatePaymentsourceModal() {
    this.dialog
      .open<
        AdminPaymentsourceCreateModalResult,
        AdminPaymentsourceCreateModalInput
      >(AdminPaymentsourceCreateModal, {
        data: {
          eventgroup: this.paymentgroup!.eventgroup,
          paymentgroup: this.paymentgroup!,
        },
      })
      .closed.subscribe((paymentsource) => {
        if (paymentsource) {
          this.refresh()
        }
      })
  }

  public deletePaymentsource(paymentsource: ApiPaymentsourceAdmin) {
    if (
      confirm(
        "Er du sikker på at du vil slette registreringen? Du kan senere hente den frem igjen på den detaljerte visningen.",
      )
    ) {
      this.adminPaymentsourceService.delete(paymentsource.id).subscribe({
        next: () => {
          this.pageService.toast("Registeringen ble slettet", {
            class: "success",
          })
          this.refresh()
        },
        error: () => {
          this.pageService.toast("Ukjent feil ved sletting av registering", {
            class: "warning",
          })
        },
      })
    }
  }

  private derivePaymentsources(paymentgroup: AdminPaymentgroupData) {
    const cashgroups_link: Record<
      string,
      {
        title: string
        cashunique: string[]
        cashuniquesum: Record<string, number>
        cols: ApiPaymentsourceAdmin[]
        rows: {
          key: string
          is_num: boolean
          items: string[]
          total: number
          amount: number
        }[]
        total: number
        is_deleted: boolean
      }
    > = {}

    const ps = {
      sum: 0,
      cashgroups: [] as (typeof cashgroups_link)["foo"][],
      other: [] as ApiPaymentsourceAdmin[],
      payments_deviation_prefix:
        paymentgroup.eventgroup.paymentsources_data[
          "payments_deviation_prefix"
        ] || "Kassedifferanse",
      orders_deviation_prefix:
        paymentgroup.eventgroup.paymentsources_data[
          "orders_deviation_prefix"
        ] || "Utestående beløp",
    }

    const processCashItem = (paymentsource: ApiPaymentsourceAdmin) => {
      if (paymentsource.is_deleted) {
        paymentsource.title = "Slettede oppføringer: " + paymentsource.title
      }

      if (!(paymentsource.title in cashgroups_link)) {
        cashgroups_link[paymentsource.title] = {
          title: paymentsource.title,
          cashunique: ["1", "5", "10", "20", "50", "100", "200", "500", "1000"], // 'other' might be existent
          cashuniquesum: {},
          cols: [],
          rows: [],
          total: 0,
          is_deleted: paymentsource.is_deleted,
        }
        ps.cashgroups.push(cashgroups_link[paymentsource.title])
      }

      const group = cashgroups_link[paymentsource.title]

      for (const [key, val] of Object.entries(paymentsource.data || {})) {
        if (!group.cashunique.includes(key)) {
          group.cashunique.push(key)
        }
        group.cashuniquesum[key] = (group.cashuniquesum[key] || 0) + val
      }

      group.total += paymentsource.amount
      group.cols.push(paymentsource)
    }

    for (const paymentsource of paymentgroup.paymentsources) {
      if (!paymentsource.is_deleted) ps.sum += paymentsource.amount

      if (paymentsource.type == "cash") {
        processCashItem(paymentsource)
      } else {
        ps.other.push(paymentsource)
      }
    }

    for (const group of ps.cashgroups) {
      group.cashunique.sort((a, b) => a.localeCompare(b))
      group.rows = group.cashunique.map((key) => {
        const is_num = /^\d+(\.\d+)?/.test(key)
        const m = is_num ? parseFloat(key) : 1
        const total = group.cashuniquesum[key] || 0

        return {
          key: key,
          is_num: is_num,
          items: [],
          total: total,
          amount: total * m,
        }
      })

      for (const paymentsource of group.cols) {
        let i = 0
        for (const key of group.cashunique) {
          group.rows[i].items.push(
            paymentsource.data![key] ? String(paymentsource.data![key]) : "",
          )
          i++
        }
      }
    }

    return ps
  }
}
