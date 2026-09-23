import { Component, inject, input } from "@angular/core"
import { rxResource } from "@angular/core/rxjs-interop"
import { FormsModule } from "@angular/forms"
import { Router, RouterLink } from "@angular/router"
import { toastErrorHandler } from "../../common/errors"
import { FormatdatePipe } from "../../common/formatdate.pipe"
import { PagePropertyComponent } from "../../common/page-property.component"
import { PageStatesComponent } from "../../common/page-states.component"
import { ToastService } from "../../common/toast.service"
import { AdminEventService } from "../event/admin-event.service"
import { AdminTicketgroupService } from "./admin-ticketgroup.service"

@Component({
  selector: "billett-admin-ticketgroup-create",
  imports: [
    PagePropertyComponent,
    FormatdatePipe,
    FormsModule,
    RouterLink,
    PageStatesComponent,
  ],
  templateUrl: "./admin-ticketgroup-create.component.html",
})
export class AdminTicketgroupCreateComponent {
  private adminTicketgroupService = inject(AdminTicketgroupService)
  private adminEventService = inject(AdminEventService)
  private router = inject(Router)
  private toastService = inject(ToastService)

  eventId = input.required<string>()

  eventResource = rxResource({
    params: () => this.eventId(),
    stream: ({ params }) => this.adminEventService.get(params),
  })

  form = {
    title: "",
    ticket_text: "",
    price: 0,
    fee: null as number | null,
    limit: 0,
    use_office: false,
    use_web: false,
    is_normal: true,
  }

  submit() {
    const eventId = this.eventResource.value()!.id
    this.adminTicketgroupService
      .create({
        event_id: eventId,
        ...this.form,
        fee: this.form.fee ?? 0,
      })
      .subscribe({
        next: () => {
          void this.router.navigateByUrl(`/a/event/${eventId}`)
        },
        error: toastErrorHandler(this.toastService),
      })
  }
}
