import { AsyncPipe } from "@angular/common"
import {
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  input,
  linkedSignal,
  OnInit,
  signal,
} from "@angular/core"
import { rxResource } from "@angular/core/rxjs-interop"
import { FormsModule } from "@angular/forms"
import { Router, RouterLink } from "@angular/router"
import { catchError, firstValueFrom, of, tap } from "rxjs"
import { api } from "../../api"
import { ApiTicketgroup } from "../../apitypes"
import { AuthService } from "../../auth/auth.service"
import { toastErrorHandler } from "../../common/errors"
import { FormatdatePipe } from "../../common/formatdate.pipe"
import { MarkdownComponent } from "../../common/markdown.component"
import { ObservableType } from "../../common/observable"
import { PagePropertyComponent } from "../../common/page-property.component"
import { PageStatesComponent } from "../../common/page-states.component"
import { PricePipe } from "../../common/price.pipe"
import { ToastService } from "../../common/toast.service"
import {
  EventReservationItem,
  EventReservationService,
} from "./event-reservation.service"
import { EventService } from "./event.service"

declare global {
  interface Window {
    VippsCheckout: (options: {
      checkoutFrontendUrl: string
      iFrameContainerId: string
      language: string
      token: string
    }) => void
  }
}

@Component({
  selector: "billett-guest-event",
  imports: [
    FormatdatePipe,
    RouterLink,
    PricePipe,
    FormsModule,
    PagePropertyComponent,
    MarkdownComponent,
    AsyncPipe,
    PageStatesComponent,
  ],
  templateUrl: "./event.component.html",
  styleUrl: "./event.component.scss",
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class GuestEventComponent implements OnInit {
  private eventService = inject(EventService)
  private eventReservationService = inject(EventReservationService)
  private router = inject(Router)
  private toastService = inject(ToastService)
  public authService = inject(AuthService)

  id = input.required<string>()

  eventResource = rxResource({
    params: () => this.id(),
    stream: ({ params }) =>
      this.eventService.get(params).pipe(
        tap((event) => {
          // do we have an alias not being used?
          if (event.alias != null && params != event.alias) {
            void this.router.navigateByUrl("/event/" + event.alias, {
              replaceUrl: true,
            })
          }
        }),
      ),
  })

  event_status = computed(() => {
    if (!this.eventResource.hasValue()) return undefined
    const event = this.eventResource.value()
    return event.selling_text &&
      (event.web_selling_status == "unknown" ||
        event.web_selling_status == "no_web_tickets")
      ? "selling_text"
      : event.web_selling_status
  })

  restoredReservation = rxResource({
    params: () => this.id(),
    stream: () =>
      this.eventReservationService.restoreReservation().pipe(
        catchError((error) => {
          console.warn("Failed to restore reservation - ignoring", error)
          return of(undefined)
        }),
      ),
  })

  reservation = linkedSignal<EventReservationItem | null | undefined>(() =>
    this.restoredReservation.value(),
  )

  recruiter = signal("")
  counts = signal<Record<number, number>>({})
  vipps_checkout = signal(false)

  forcePay = false

  api = api

  count = computed(() => {
    const reservation = this.reservation()
    if (reservation) {
      return reservation.data.tickets.length
    }

    return Object.values(this.counts()).reduce((acc, count) => acc + count, 0)
  })

  totalAmount = computed(() => {
    const reservation = this.reservation()
    if (reservation) {
      return reservation.data.total_amount
    }

    return (this.eventResource.value()?.ticketgroups ?? []).reduce(
      (acc, ticketgroup) =>
        acc +
        this.getTicketgroupCount(ticketgroup) *
          (ticketgroup.price + ticketgroup.fee),
      0,
    )
  })

  availableCount = computed(
    () => (this.eventResource.value()?.max_each_person ?? 0) - this.count(),
  )

  private reset() {
    this.reservation.set(null)
    this.recruiter.set("")
    this.vipps_checkout.set(false)
  }

  getTicketgroupCount(ticketgroup: ApiTicketgroup) {
    return this.counts()[ticketgroup.id] ?? 0
  }

  changeTicketgroupNum(ticketgroup: ApiTicketgroup, num: number) {
    this.counts.update((counts) => ({
      ...counts,
      [ticketgroup.id]: (counts[ticketgroup.id] ?? 0) + num,
    }))
  }

  abortOrder() {
    this.reservation()!
      .abort()
      .subscribe({
        next: () => {
          this.reset()
        },
        error: toastErrorHandler(
          this.toastService,
          "Klarte ikke å avbryte reservasjonen",
        ),
      })
  }

  async placeOrder(force?: boolean) {
    let reservation = this.reservation()
    if (!reservation) {
      if (this.count() == 0) {
        this.toastService.show("Du må velge noen billetter.", {
          class: "warning",
        })
        return
      }

      const groups = Object.fromEntries(
        Object.entries(this.counts()).filter(([, count]) => count > 0),
      )

      try {
        reservation = await firstValueFrom(
          this.eventReservationService.create(
            this.eventResource.value()!.id,
            groups,
          ),
        )
        this.reservation.set(reservation)
      } catch (error: unknown) {
        toastErrorHandler(
          this.toastService,
          "Ukjent feil oppsto ved henting av reservasjon",
        )(error)
        return
      }
    }

    const data = {
      recruiter: this.recruiter(),
    }
    try {
      await firstValueFrom(reservation.update(data))
    } catch (error: unknown) {
      toastErrorHandler(
        this.toastService,
        "Ukjent feil oppsto ved lagring av kontaktdata",
      )(error)
      return
    }

    // send to payment
    let response: ObservableType<ReturnType<EventReservationItem["place"]>>
    try {
      response = await firstValueFrom(reservation.place(force))
    } catch (error: unknown) {
      toastErrorHandler(
        this.toastService,
        "Ukjent feil oppsto ved lagring av ordre",
      )(error)
      return
    }
    if (force) {
      // details about the order is fetched at the
      // completed url
      void this.router.navigateByUrl("order/complete")
      return
    } else {
      this.vipps_checkout.set(true)

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
}
