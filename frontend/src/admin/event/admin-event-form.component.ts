import { Component, input, linkedSignal, output } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { RouterLink } from "@angular/router"
import { FormatdatePipe } from "../../common/formatdate.pipe"
import moment from "../../common/moment"
import { AdminEventCreateData, AdminEventData } from "./admin-event.service"

const formatTime = (t: number | null | undefined) =>
  t ? moment.unix(t).format("DD.MM.YYYY HH:mm") : ""

@Component({
  selector: "billett-admin-event-form",
  standalone: true,
  imports: [FormsModule, RouterLink, FormatdatePipe],
  templateUrl: "./admin-event-form.component.html",
})
export class AdminEventFormComponent {
  event = input.required<AdminEventData | AdminEventCreateData>()
  eventgroupId = input.required<number>()
  submitForm = output()

  time_start_text = linkedSignal(() => formatTime(this.event().time_start))
  time_end_text = linkedSignal(() => formatTime(this.event().time_end))

  get eventId() {
    const event = this.event()
    return "id" in event ? event.id : null
  }

  updateTime(which: "start" | "end") {
    const text = which == "start" ? this.time_start_text : this.time_end_text
    const x = Math.max(0, moment(text(), "DD.MM.YYYY HH:mm").unix())
    this.event()[which == "start" ? "time_start" : "time_end"] = x
  }
}
