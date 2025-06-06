import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from "@angular/core"
import { FormsModule } from "@angular/forms"
import { RouterLink } from "@angular/router"
import { FormatdatePipe } from "../../common/formatdate.pipe"
import moment from "../../common/moment"
import { AdminEventCreateData, AdminEventData } from "./admin-event.service"

@Component({
  selector: "billett-admin-event-form",
  standalone: true,
  imports: [FormsModule, RouterLink, FormatdatePipe],
  templateUrl: "./admin-event-form.component.html",
})
export class AdminEventFormComponent implements OnChanges {
  @Input()
  event!: AdminEventData | AdminEventCreateData

  @Input()
  eventgroupId!: number

  @Output()
  submitForm = new EventEmitter<void>()

  time_start_text!: string
  time_end_text!: string

  submit() {
    this.submitForm.emit()
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["event"]) {
      const parseTime = (t: number | null | undefined) => {
        if (!t) return ""
        return moment.unix(t).format("DD.MM.YYYY HH:mm")
      }

      this.time_start_text = parseTime(this.event.time_start)
      this.time_end_text = parseTime(this.event.time_end)
    }
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
