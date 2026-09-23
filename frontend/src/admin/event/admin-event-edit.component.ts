import { Component, inject, input } from "@angular/core"
import { rxResource } from "@angular/core/rxjs-interop"
import { Router, RouterLink } from "@angular/router"
import { api } from "../../api"
import { toastErrorHandler } from "../../common/errors"
import { FormatdatePipe } from "../../common/formatdate.pipe"
import { PagePropertyComponent } from "../../common/page-property.component"
import { PageStatesComponent } from "../../common/page-states.component"
import { ToastService } from "../../common/toast.service"
import { AdminEventFormComponent } from "./admin-event-form.component"
import { AdminEventService } from "./admin-event.service"

@Component({
  selector: "billett-admin-event-edit",
  standalone: true,
  imports: [
    PageStatesComponent,
    PagePropertyComponent,
    RouterLink,
    AdminEventFormComponent,
    FormatdatePipe,
  ],
  templateUrl: "./admin-event-edit.component.html",
})
export class AdminEventEditComponent {
  private adminEventService = inject(AdminEventService)
  private router = inject(Router)
  private toastService = inject(ToastService)

  id = input.required<string>()

  api = api

  eventResource = rxResource({
    params: () => this.id(),
    stream: ({ params }) => this.adminEventService.get(params),
  })

  storeEvent() {
    const event = this.eventResource.value()
    if (!event || isNaN(event.time_start)) return

    this.adminEventService.update(event).subscribe({
      next: () => {
        void this.router.navigateByUrl(`/a/event/${event.id}`)
      },
      error: toastErrorHandler(this.toastService),
    })
  }
}
