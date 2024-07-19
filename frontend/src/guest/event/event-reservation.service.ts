import { HttpClient } from "@angular/common/http"
import { inject, Injectable } from "@angular/core"
import { catchError, defer, map, mergeMap, of, tap } from "rxjs"
import { api } from "../../api"
import { ApiEvent, ApiOrder, ApiTicket, ApiTicketgroup } from "../../apitypes"

type ReservationData = ApiOrder & {
  tickets: (ApiTicket & {
    event: ApiEvent
    ticketgroup: ApiTicketgroup
  })[]
}

export class EventReservationItem {
  constructor(
    public data: ReservationData,
    private http: HttpClient,
    private eventReservationService: EventReservationService,
  ) {}

  persist() {
    if (typeof Storage !== "undefined") {
      sessionStorage.setItem("pendingReservation", JSON.stringify(this.data))
    }
  }

  abort() {
    const id = this.data.id
    return this.http.delete(api(`order/${encodeURIComponent(id)}`)).pipe(
      tap(() => {
        this.eventReservationService.removePersistedReservation(id)
      }),
    )
  }

  update(data: { recruiter: string }) {
    return this.http
      .patch<ReservationData>(
        api(`order/${encodeURIComponent(this.data.id)}`),
        data,
      )
      .pipe(
        tap((updatedData) => {
          this.data = updatedData
        }),
      )
  }

  // send to payment
  place(force?: boolean) {
    return this.http.post<{
      checkoutFrontendUrl: string
      token: string
    }>(
      api(
        `order/${encodeURIComponent(this.data.id)}/${force ? "force" : "place"}`,
      ),
      null,
    )
  }
}

@Injectable({
  providedIn: "root",
})
export class EventReservationService {
  private http = inject(HttpClient)

  /**
   * The active reservation (should really only be one).
   */
  current: EventReservationItem | undefined

  setReservation(data: ReservationData) {
    this.current = new EventReservationItem(data, this.http, this)
    this.current.persist()
    return this.current
  }

  getReservation(id: number) {
    return this.http
      .get<ReservationData>(api(`order/${encodeURIComponent(id)}`))
      .pipe(
        tap((data) => {
          if (data.is_valid) {
            // real order, no reservation
            throw new Error("last reservation is valid order")
          }
        }),
        map((data) => new EventReservationItem(data, this.http, this)),
      )
  }

  removePersistedReservation(only_id?: number) {
    if (only_id && this.current && this.current.data.id != only_id) return

    this.current = undefined
    if (typeof Storage !== "undefined") {
      sessionStorage.removeItem("pendingReservation")
    }
  }

  restoreReservation() {
    return defer(() => of(sessionStorage.getItem("pendingReservation"))).pipe(
      mergeMap((pendingReservation) => {
        if (!pendingReservation) {
          return of(undefined)
        }

        const data = JSON.parse(pendingReservation)

        return this.getReservation(data.id).pipe(
          tap((reservation) => {
            this.current = reservation
          }),
          catchError((error) => {
            this.removePersistedReservation()
            throw error
          }),
        )
      }),
    )
  }

  create(event_id: number, ticketgroups: Record<number, number>) {
    return this.http
      .post<ReservationData>(
        api(`event/${encodeURIComponent(event_id)}/createreservation`),
        {
          ticketgroups: ticketgroups,
        },
      )
      .pipe(map((data) => this.setReservation(data)))
  }
}
