import { CommonModule } from "@angular/common"
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  Input,
  OnInit,
} from "@angular/core"
import { FormsModule } from "@angular/forms"
import { Router, RouterLink } from "@angular/router"
import { api } from "../../api"
import { AuthService } from "../../auth/auth.service"
import { FormatdatePipe } from "../../common/formatdate.pipe"
import { PagePropertyComponent } from "../../common/page-property.component"
import { PageService } from "../../common/page.service"
import { PricePipe } from "../../common/price.pipe"
import {
  handleResourceLoadingStates,
  ResourceLoadingState,
} from "../../common/resource-loading"
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
    CommonModule,
  ],
  templateUrl: "./event.component.html",
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class GuestEventComponent implements OnInit {
  private eventService = inject(EventService)
  private eventReservationService = inject(EventReservationService)
  private router = inject(Router)
  private pageService = inject(PageService)
  public auth = inject(AuthService)

  @Input()
  id!: string

  pageState = new ResourceLoadingState()

  event?: Event & {
    ticketgroups: {
      order_count: number
    }[]
  }

  event_status: string | null | undefined

  loadingReservation = false
  reservation: EventReservationItem | null | undefined
  contact: any
  newres: any
  vipps_checkout: any

  forcePay = false

  api = api

  private reset() {
    this.reservation = null
    this.contact = {}
    this.newres = {}
    this.newres.count = 0
    this.newres.total_amount = 0
    this.vipps_checkout = false
  }

  // add/remove ticketgroup selection
  changeTicketgroupNum(ticketgroup, num) {
    if (!("order_count" in ticketgroup)) ticketgroup.order_count = 0
    ticketgroup.order_count += num
    this.event!.max_each_person! -= num
    this.newres.total_amount += num * (ticketgroup.price + ticketgroup.fee)
    this.newres.count += num
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

  async placeOrder(force) {
    if (!this.reservation) {
      if (this.newres.count == 0) {
        this.pageService.toast("Du må velge noen billetter.", {
          class: "warning",
        })
        alert("Du må velge noen billetter.")
        return
      }

      var groups = {}
      for (const g of this.event!.ticketgroups) {
        var c = g.order_count ?? 0
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
      recruiter: this.contact.recruiter,
    }
    try {
      await this.reservation.update(data)
    } catch (err: any) {
      // TODO(migrate): error object structure
      if (err == "data validation failed") {
        this.pageService.toast("Ugyldig inndata i skjemaet.", {
          class: "warning",
        })
      } else {
        const msg = "data" in err ? err.data : err
        alert("Ukjent feil oppsto ved lagring av kontaktdata: " + msg)
        return
      }
    }

    // send to payment
    let response
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
    const script = document.createElement("script")
    script.type = "text/javascript"
    script.src =
      "https://checkout.vipps.no/checkout-button/v1/vipps-checkout-button.js"
    document.head.append(script)

    this.eventService
      .get(this.id)
      .pipe(handleResourceLoadingStates(this.pageState))
      .subscribe((event) => {
        this.event = {
          ...event,
          ticketgroups: event.ticketgroups.map((ticketgroup) => ({
            ...ticketgroup,
            order_count: 0,
          })),
        }

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
