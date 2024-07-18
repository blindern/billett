import { AsyncPipe } from "@angular/common"
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from "@angular/core"
import { FormsModule } from "@angular/forms"
import { Router, RouterLink } from "@angular/router"
import { api } from "../../api"
import { ApiTicketgroup } from "../../apitypes"
import { AuthService } from "../../auth/auth.service"
import { FormatdatePipe } from "../../common/formatdate.pipe"
import { MarkdownComponent } from "../../common/markdown.component"
import { PagePropertyComponent } from "../../common/page-property.component"
import { PricePipe } from "../../common/price.pipe"
import {
  handleResourceLoadingStates,
  ResourceLoadingState,
} from "../../common/resource-loading"
import { ToastService } from "../../common/toast.service"
import {
  EventReservationItem,
  EventReservationService,
} from "./event-reservation.service"
import { Event, EventService } from "./event.service"

declare global {
  interface Window {
    VippsCheckout: any
  }
}

@Component({
  selector: "billett-guest-event",
  standalone: true,
  imports: [
    FormatdatePipe,
    RouterLink,
    PricePipe,
    FormsModule,
    PagePropertyComponent,
    MarkdownComponent,
    AsyncPipe,
  ],
  templateUrl: "./event.component.html",
  styleUrl: "./event.component.scss",
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class GuestEventComponent implements OnInit, OnChanges {
  private eventService = inject(EventService)
  private eventReservationService = inject(EventReservationService)
  private router = inject(Router)
  private toastService = inject(ToastService)
  public authService = inject(AuthService)

  @Input()
  id!: string

  pageState = new ResourceLoadingState()

  event?: Event

  event_status: string | null | undefined

  loadingReservation = false
  reservation: EventReservationItem | null | undefined

  recruiter = ""
  ticketgroups: {
    ticketgroup: ApiTicketgroup
    count: number
  }[] = []

  vipps_checkout: any

  forcePay = false

  api = api

  get count() {
    if (this.reservation) {
      return this.reservation.data.tickets.length
    }

    return this.ticketgroups.reduce((acc, { count }) => acc + count, 0)
  }

  get totalAmount() {
    if (this.reservation) {
      return this.reservation.data.total_amount
    }

    return this.ticketgroups.reduce(
      (acc, { ticketgroup, count }) =>
        acc + count * (ticketgroup.price + ticketgroup.fee),
      0,
    )
  }

  private reset() {
    this.reservation = null
    this.recruiter = ""
    this.vipps_checkout = false
  }

  get availableCount() {
    return this.event!.max_each_person - this.count
  }

  getTicketgroupCount(ticketgroup: ApiTicketgroup) {
    return (
      this.ticketgroups.find((it) => it.ticketgroup.id === ticketgroup.id)
        ?.count ?? 0
    )
  }

  changeTicketgroupNum(ticketgroup: ApiTicketgroup, num: number) {
    let found = this.ticketgroups.find(
      (it) => it.ticketgroup.id === ticketgroup.id,
    )
    if (!found) {
      found = {
        ticketgroup,
        count: 0,
      }
      this.ticketgroups.push(found)
    }

    found.count += num
  }

  // abort order
  abortOrder() {
    this.reservation!.abort().then(
      () => {
        this.reset()
      },
      (err) => {
        alert("Klarte ikke å avbryte reservasjonen. Ukjent feil: " + err)
      },
    )
  }

  async placeOrder(force?: boolean) {
    if (!this.reservation) {
      if (this.count == 0) {
        this.toastService.show("Du må velge noen billetter.", {
          class: "warning",
        })
        alert("Du må velge noen billetter.")
        return
      }

      const groups: Record<number, number> = {}
      for (const g of this.event!.ticketgroups) {
        const c = this.getTicketgroupCount(g)
        if (c <= 0) continue
        groups[g.id] = c
      }

      try {
        const res = await this.eventReservationService.create(
          this.event!.id,
          groups,
        )
        this.reservation = res
      } catch (err: any) {
        // creating reservation failed
        // TODO: handle error cases
        // TODO(migrate): error object structure
        const msg = "data" in err ? err.data : err
        alert("Ukjent feil oppsto ved henting av reservasjon: " + msg)
        return
      }
    }

    const data = {
      recruiter: this.recruiter,
    }
    try {
      await this.reservation.update(data)
    } catch (err: any) {
      // TODO(migrate): error object structure
      if (err == "data validation failed") {
        this.toastService.show("Ugyldig inndata i skjemaet.", {
          class: "warning",
        })
      } else {
        const msg = "data" in err ? err.data : err
        alert("Ukjent feil oppsto ved lagring av kontaktdata: " + msg)
        return
      }
    }

    // send to payment
    let response: Awaited<ReturnType<EventReservationItem["place"]>>
    try {
      response = await this.reservation.place(force)
    } catch (err: any) {
      // TODO: handle error cases
      // TODO(migrate): error object structure
      const msg = "data" in err ? err.data : err
      alert("Ukjent feil oppsto ved lagring av ordre: " + msg)
    }
    if (force) {
      // details about the order is fetched at the
      // completed url
      this.router.navigateByUrl("order/complete")
      return
    } else {
      this.vipps_checkout = true

      const checkout = () => {
        window.VippsCheckout({
          checkoutFrontendUrl: response.checkoutFrontendUrl,
          iFrameContainerId: "vipps-checkout-frame-container",
          language: "no",
          token: response.token,
        })
      }

      if (window.VippsCheckout != null) {
        // Schedule to after render.
        setTimeout(() => void checkout(), 0)
      } else {
        const script = document.createElement("script")
        script.src = "https://checkout.vipps.no/vippsCheckoutSDK.js"
        script.onload = checkout
        document.head.append(script)
      }
    }
  }

  ngOnInit(): void {
    const src =
      "https://checkout.vipps.no/checkout-button/v1/vipps-checkout-button.js"
    if (!document.querySelector(`script[src="${src}"]`)) {
      const script = document.createElement("script")
      script.type = "text/javascript"
      script.src = src
      document.head.append(script)
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["id"]) {
      this.eventService
        .get(this.id)
        .pipe(handleResourceLoadingStates(this.pageState))
        .subscribe((event) => {
          this.event = event

          this.event_status = event.web_selling_status
          if (
            event.selling_text &&
            (event.web_selling_status == "unknown" ||
              event.web_selling_status == "no_web_tickets")
          ) {
            this.event_status = "selling_text"
          }

          // do we have an alias not being used?
          if (event.alias != null && this.id != event.alias) {
            this.router.navigateByUrl("/event/" + event.alias, {
              replaceUrl: true,
            })
          }
        })

      // check for reservation
      this.loadingReservation = true
      this.eventReservationService
        .restoreReservation()
        .then((reservationResult) => {
          this.reservation = reservationResult
        })
        .catch(() => null)
        .finally(() => {
          this.loadingReservation = false
        })

      this.reset()
    }
  }
}
