import { HttpClient } from "@angular/common/http"
import { inject, Injectable } from "@angular/core"
import { firstValueFrom } from "rxjs"
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

  async abort() {
    const id = this.data.id
    await firstValueFrom(
      this.http.delete(api(`order/${encodeURIComponent(id)}`)),
    )
    this.eventReservationService.removePersistedReservation(id)
  }

  async update(data: { recruiter: string }) {
    const updatedData = await firstValueFrom(
      this.http.patch<ReservationData>(
        api(`order/${encodeURIComponent(this.data.id)}`),
        data,
      ),
    )
    this.data = updatedData
    return updatedData
  }

  // send to payment
  async place(force?: boolean) {
    return await firstValueFrom(
      this.http.post<{
        checkoutFrontendUrl: string
        token: string
      }>(
        api(
          `order/${encodeURIComponent(this.data.id)}/${force ? "force" : "place"}`,
        ),
        null,
      ),
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

  async getReservation(id: number) {
    const data = await firstValueFrom(
      this.http.get<ReservationData>(api(`order/${encodeURIComponent(id)}`)),
    )
    if (data.is_valid) {
      // real order, no reservation
      throw new Error("last reservation is valid order")
    }
    return new EventReservationItem(data, this.http, this)
  }

  removePersistedReservation(only_id?: number) {
    if (only_id && this.current && this.current.data.id != only_id) return

    this.current = undefined
    if (typeof Storage !== "undefined") {
      sessionStorage.removeItem("pendingReservation")
    }
  }

  async restoreReservation() {
    const pendingReservation = sessionStorage.getItem("pendingReservation")
    if (!pendingReservation) {
      throw new Error("not found")
    }

    const data = JSON.parse(pendingReservation)

    try {
      const reservation = await this.getReservation(data.id)
      this.current = reservation
      return reservation
    } catch (e) {
      this.removePersistedReservation()
      throw e
    }
  }

  async create(event_id: number, ticketgroups: Record<number, number>) {
    const data = await firstValueFrom(
      this.http.post<ReservationData>(
        api(`event/${encodeURIComponent(event_id)}/createreservation`),
        {
          ticketgroups: ticketgroups,
        },
      ),
    )

    return this.setReservation(data)
  }
}
