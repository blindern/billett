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
import moment from "moment"
import { FormatdatePipe } from "../../common/formatdate.pipe"
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
    var parseTime = (t) => {
      if (!t) return ""
      return moment.unix(t).format("DD.MM.YYYY HH:mm")
    }

    this.time_start_text = parseTime(this.event.time_start)
    this.time_end_text = parseTime(this.event.time_end)
  }

  get eventId() {
    return "id" in this.event ? this.event.id : null
  }

  updateTime(which: "start" | "end") {
    var x = moment(
      this[which == "start" ? "time_start_text" : "time_end_text"],
      "DD.MM.YYYY HH:mm",
    ).unix()

    if (x < 0) x = 0
    this.event[which == "start" ? "time_start" : "time_end"] = x
  }
}
