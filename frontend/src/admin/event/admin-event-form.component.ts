import { Component, EventEmitter, Input, Output } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { RouterLink } from "@angular/router"
import moment from "moment"
import { FormatdatePipe } from "../../common/formatdate.pipe"
import { AdminEventCreateData, AdminEventData } from "./admin-event.service"

@Component({
  selector: "billett-admin-event-form",
  standalone: true,
  imports: [FormsModule, RouterLink, FormatdatePipe],
  templateUrl: "./admin-event-form.component.html",
})
export class AdminEventFormComponent {
  @Input()
  event!: AdminEventData | AdminEventCreateData

  @Input()
  eventgroupId!: number

  @Output()
  submitForm = new EventEmitter<void>()

  submit() {
    this.submitForm.emit()
  }

  get time_start_text() {
    return this.#parseTime(this.event.time_start)
  }

  get time_end_text() {
    return this.#parseTime(this.event.time_end)
  }

  #parseTime(t: number | null | undefined) {
    if (!t) return ""
    return moment.unix(t).format("DD.MM.YYYY HH:mm")
  }

  get eventId() {
    return "id" in this.event ? this.event.id : null
  }

  updateTime(which: "start" | "end") {
    let x = moment(
      this[which == "start" ? "time_start_text" : "time_end_text"],
      "DD.MM.YYYY HH:mm",
    ).unix()

    if (x < 0) x = 0
    this.event[which == "start" ? "time_start" : "time_end"] = x
  }
}
