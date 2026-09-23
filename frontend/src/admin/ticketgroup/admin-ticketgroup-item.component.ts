import { Component, inject, input } from "@angular/core"
import { rxResource } from "@angular/core/rxjs-interop"
import { FormsModule } from "@angular/forms"
import { Router, RouterLink } from "@angular/router"
import { tap } from "rxjs"
import { toastErrorHandler } from "../../common/errors"
import { FormatdatePipe } from "../../common/formatdate.pipe"
import { PagePropertyComponent } from "../../common/page-property.component"
import { PageStatesComponent } from "../../common/page-states.component"
import { ToastService } from "../../common/toast.service"
import { AdminTicketgroupService } from "./admin-ticketgroup.service"

@Component({
  selector: "billett-admin-ticketgroup-item",
  standalone: true,
  imports: [
    PagePropertyComponent,
    FormatdatePipe,
    FormsModule,
    RouterLink,
    PageStatesComponent,
  ],
  templateUrl: "./admin-ticketgroup-item.component.html",
})
export class AdminTicketgroupItemComponent {
  private adminTicketgroupService = inject(AdminTicketgroupService)
  private router = inject(Router)
  private toastService = inject(ToastService)

  eventId = input.required<string>()
  ticketgroupId = input.required<string>()

  ticketgroupResource = rxResource({
    params: () => ({ eventId: this.eventId(), id: this.ticketgroupId() }),
    stream: ({ params }) =>
      this.adminTicketgroupService.get(params.id).pipe(
        tap((data) => {
          if (String(data.event.id) !== params.eventId) {
            void this.router.navigateByUrl("/a")
          }
        }),
      ),
  })

  updateTicketgroup() {
    const ticketgroup = this.ticketgroupResource.value()!
    this.adminTicketgroupService.update(ticketgroup).subscribe({
      next: () => {
        void this.router.navigateByUrl(`/a/event/${ticketgroup.event.id}`)
      },
      error: toastErrorHandler(this.toastService),
    })
  }

  deleteTicketgroup() {
    // TODO: no delete on valid/reserved tickets
    const ticketgroup = this.ticketgroupResource.value()!
    this.adminTicketgroupService.delete(ticketgroup.id).subscribe({
      next: () => {
        void this.router.navigateByUrl(`/a/event/${ticketgroup.event.id}`)
      },
      error: toastErrorHandler(this.toastService),
    })
  }
}
