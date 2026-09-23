import { Component, inject, input } from "@angular/core"
import { rxResource } from "@angular/core/rxjs-interop"
import { Router, RouterLink } from "@angular/router"
import { api } from "../../api"
import { toastErrorHandler } from "../../common/errors"
import { PagePropertyComponent } from "../../common/page-property.component"
import { PageStatesComponent } from "../../common/page-states.component"
import { ToastService } from "../../common/toast.service"
import { AdminEventgroupService } from "../eventgroup/admin-eventgroup.service"
import { AdminEventFormComponent } from "./admin-event-form.component"
import { AdminEventCreateData, AdminEventService } from "./admin-event.service"

@Component({
  selector: "billett-admin-event-create",
  standalone: true,
  imports: [
    PageStatesComponent,
    RouterLink,
    AdminEventFormComponent,
    PagePropertyComponent,
  ],
  templateUrl: "./admin-event-create.component.html",
})
export class AdminEventCreateComponent {
  private adminEventgroupService = inject(AdminEventgroupService)
  private adminEventService = inject(AdminEventService)
  private router = inject(Router)
  private toastService = inject(ToastService)

  eventgroupId = input.required<string>()

  api = api

  eventgroupResource = rxResource({
    params: () => this.eventgroupId(),
    stream: ({ params }) => this.adminEventgroupService.get(params),
  })

  event: AdminEventCreateData = {
    max_sales: 0,
    max_each_person: 10,
  }

  storeEvent() {
    if (!this.event.time_start || isNaN(this.event.time_start)) return

    this.adminEventService
      .create({
        ...this.event,
        eventgroup_id: this.eventgroupResource.value()!.id,
      })
      .subscribe({
        next: (data) => {
          void this.router.navigateByUrl(`/a/event/${data.id}`)
        },
        error: toastErrorHandler(this.toastService),
      })
  }
}
