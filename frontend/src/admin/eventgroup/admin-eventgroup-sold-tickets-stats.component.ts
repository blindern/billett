import { Component, Input, OnInit } from "@angular/core"
import { RouterLink } from "@angular/router"
import { FormatdatePipe } from "../../common/formatdate.pipe"
import { PagePropertyComponent } from "../../common/page-property.component"
import { PageStatesComponent } from "../../common/page-states.component"
import { PageService } from "../../common/page.service"
import { PricePipe } from "../../common/price.pipe"
import {
  handleResourceLoadingStates,
  ResourceLoadingState,
} from "../../common/resource-loading"
import {
  AdminEventgroupService,
  AdminSoldTicketsStatsData,
} from "./admin-eventgroup.service"

class Accum {
  parents: Accum[] = []
  count = 0
  revoked = 0
  price = 0
  fee = 0
  add = (count: number, revoked: number, price: number, fee: number) => {
    this.count += count
    this.revoked += revoked
    this.price += price * (count - revoked)
    this.fee += fee * (count - revoked)
    for (const parent of this.parents) {
      parent.add(count, revoked, price, fee)
    }
    return this
  }
  parent(parent: Accum) {
    this.parents.push(parent)
    return this
  }
}

@Component({
  selector: "admin-eventgroup-sold-tickets-stats",
  standalone: true,
  imports: [
    PageStatesComponent,
    PricePipe,
    PagePropertyComponent,
    RouterLink,
    FormatdatePipe,
  ],
  templateUrl: "./admin-eventgroup-sold-tickets-stats.component.html",
})
export class AdminEventgroupSoldTicketsStatsComponent implements OnInit {
  @Input()
  id!: string

  pageState = new ResourceLoadingState()
  stats?: ReturnType<AdminEventgroupSoldTicketsStatsComponent["deriveStats"]>

  constructor(
    private adminEventgroupService: AdminEventgroupService,
    private pageService: PageService,
  ) {}

  ngOnInit(): void {
    this.pageService.set("title", "Billettstatistikk for arrangementgruppe")

    this.adminEventgroupService
      .getSoldTicketsStats(this.id)
      .pipe(handleResourceLoadingStates(this.pageState))
      .subscribe((data) => {
        this.stats = this.deriveStats(data)
      })
  }

  deriveStats(data: AdminSoldTicketsStatsData) {
    const days = Array.from(
      new Set<string>(data.tickets.map((ticket) => ticket.day)),
    )
      .filter((it) => it != null)
      .sort()
      .reverse()

    let topAccum = new Accum()
    let daysAccum = Object.fromEntries(days.map((day) => [day, new Accum()]))

    let max_sales = 0
    let max_normal_sales = 0

    let lastDay: string | undefined
    const daysDetails: { day: string; short: string }[] = days.map((day) => {
      const tmp = lastDay
      lastDay = day

      return {
        day: day,
        short:
          !tmp || tmp.slice(0, 7) != day.slice(0, 7) ? day : "-" + day.slice(8),
      }
    })

    const events2 = {}
    const events: any[] = []
    for (const event of data.events) {
      event.ticketgroups = []
      event.accum = new Accum().parent(topAccum)
      event.daysAccum = Object.fromEntries(
        days.map((day) => [day, new Accum()]),
      )
      events2[event.id] = event
      events.push(event)

      max_sales += event.max_sales
      max_normal_sales += event.max_normal_sales || event.max_sales
    }

    const ticketgroups = {}
    for (const ticketgroup of data.ticketgroups) {
      ticketgroup.days = {}
      ticketgroup.accum = new Accum().parent(
        events2[ticketgroup.event_id].accum,
      )
      days.forEach((day) => {
        ticketgroup.days[day] = null
      })
      events2[ticketgroup.event_id].ticketgroups.push(ticketgroup)
      ticketgroups[ticketgroup.id] = ticketgroup
    }

    for (const ticket of data.tickets) {
      if (!ticket.day) continue
      const ticketgroup = ticketgroups[ticket.ticketgroup_id]
      const event = events2[ticket.event_id]
      ticketgroup.days[ticket.day] = ticket
      ticket.accum = new Accum()
        .parent(ticketgroup.accum)
        .parent(daysAccum[ticket.day])
        .parent(event.daysAccum[ticket.day])
        .add(
          ticket.num_tickets,
          ticket.num_revoked,
          ticketgroup.price,
          ticketgroup.fee,
        )
    }

    return {
      topAccum,
      daysAccum,
      max_sales,
      max_normal_sales,
      days,
      daysDetails,
      events,
    }
  }
}
