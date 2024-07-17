import { HttpClient } from "@angular/common/http"
import { inject, Injectable } from "@angular/core"
import { firstValueFrom } from "rxjs"
import { api } from "../../api"

export class EventReservationItem {
  constructor(
    public data: any,
    private http: HttpClient,
    private eventReservationService: EventReservationService,
  ) {}

  persist() {
    if (typeof Storage !== "undefined") {
      sessionStorage.setItem("pendingReservation", JSON.stringify(this.data))
    }
  }

  async abort() {
    var id = this.data.id
    await firstValueFrom(this.http.delete(api("order/" + id)))
    this.eventReservationService.removePersistedReservation(id)
  }

  async update(data) {
    const updatedData = await firstValueFrom(
      this.http.patch<any>(api("order/" + this.data.id), data),
    )
    this.data = updatedData
    return updatedData
  }

  // send to payment
  async place(force) {
    return await firstValueFrom(
      this.http.post<any>(
        api("order/" + this.data.id + "/" + (force ? "force" : "place")),
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

  setReservation(data: any) {
    this.current = new EventReservationItem(data, this.http, this)
    this.current.persist()
    return this.current
  }

  async getReservation(id) {
    const data = await firstValueFrom(this.http.get<any>(api("order/" + id)))
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

    var data = JSON.parse(pendingReservation)

    try {
      const reservation = await this.getReservation(data.id)
      this.current = reservation
      return reservation
    } catch (e) {
      this.removePersistedReservation()
      throw e
    }
  }

  async create(event_id, ticketgroups) {
    const data = await firstValueFrom(
      this.http.post(api("event/" + event_id + "/createreservation"), {
        ticketgroups: ticketgroups,
      }),
    )

    return this.setReservation(data)
  }
}
