import { Component, inject, Input, OnInit } from "@angular/core"
import { RouterLink } from "@angular/router"
import { ApiSoldTicketsStats } from "../../apitypes"
import { FormatdatePipe } from "../../common/formatdate.pipe"
import { PagePropertyComponent } from "../../common/page-property.component"
import { PageStatesComponent } from "../../common/page-states.component"
import { PageService } from "../../common/page.service"
import { PricePipe } from "../../common/price.pipe"
import {
  handleResourceLoadingStates,
  ResourceLoadingState,
} from "../../common/resource-loading"
import { AdminEventgroupService } from "./admin-eventgroup.service"

class Accum {
  parents: Accum[] = []
  count = 0
  revoked = 0
  price = 0
  fee = 0
  add(count: number, revoked: number, price: number, fee: number) {
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
  selector: "billett-admin-eventgroup-sold-tickets-stats",
  standalone: true,
  imports: [
    PageStatesComponent,
    PricePipe,
    PagePropertyComponent,
    RouterLink,
    FormatdatePipe,
  ],
  templateUrl: "./admin-eventgroup-sold-tickets-stats.component.html",
  styleUrl: "./admin-eventgroup-sold-tickets-stats.component.scss",
})
export class AdminEventgroupSoldTicketsStatsComponent implements OnInit {
  private adminEventgroupService = inject(AdminEventgroupService)
  private pageService = inject(PageService)

  @Input()
  id!: string

  pageState = new ResourceLoadingState()
  stats?: ReturnType<AdminEventgroupSoldTicketsStatsComponent["deriveStats"]>

  ngOnInit(): void {
    this.pageService.set("title", "Billettstatistikk for arrangementgruppe")

    this.adminEventgroupService
      .getSoldTicketsStats(this.id)
      .pipe(handleResourceLoadingStates(this.pageState))
      .subscribe((data) => {
        this.stats = this.deriveStats(data)
      })
  }

  deriveStats(data: ApiSoldTicketsStats) {
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

    const events = data.events.map((event) => {
      max_sales += event.max_sales
      max_normal_sales += event.max_normal_sales || event.max_sales

      return {
        ...event,
        ticketgroups: [] as ApiSoldTicketsStats["ticketgroups"][0][],
        accum: new Accum().parent(topAccum),
        daysAccum: Object.fromEntries(days.map((day) => [day, new Accum()])),
      }
    })

    const eventsById = Object.fromEntries(
      events.map((event) => [event.id, event]),
    )

    const ticketgroups = Object.fromEntries(
      data.ticketgroups.map((ticketgroup) => {
        const updated = {
          ...ticketgroup,
          days: Object.fromEntries(days.map((day) => [day, null])) as Record<
            string,
            null | (ApiSoldTicketsStats["tickets"][0] & { accum: Accum })
          >,
          accum: new Accum().parent(eventsById[ticketgroup.event_id].accum),
        }

        eventsById[ticketgroup.event_id].ticketgroups.push(ticketgroup)

        return [ticketgroup.id, updated]
      }),
    )

    for (const ticket of data.tickets) {
      if (!ticket.day) continue
      const ticketgroup = ticketgroups[ticket.ticketgroup_id]
      const event = eventsById[ticket.event_id]
      ticketgroup.days[ticket.day] = {
        ...ticket,
        accum: new Accum()
          .parent(ticketgroup.accum)
          .parent(daysAccum[ticket.day])
          .parent(event.daysAccum[ticket.day])
          .add(
            ticket.num_tickets,
            ticket.num_revoked,
            Number(ticketgroup.price),
            Number(ticketgroup.fee),
          ),
      }
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
