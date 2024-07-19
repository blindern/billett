import {
  Component,
  inject,
  Input,
  OnChanges,
  SimpleChanges,
} from "@angular/core"
import { FormsModule } from "@angular/forms"
import { Router, RouterLink } from "@angular/router"
import {
  ApiEventAdmin,
  ApiEventgroupAdmin,
  ApiTicketgroupAdmin,
} from "../../apitypes"
import { toastErrorHandler } from "../../common/errors"
import { FormatdatePipe } from "../../common/formatdate.pipe"
import { PagePropertyComponent } from "../../common/page-property.component"
import { PageStatesComponent } from "../../common/page-states.component"
import {
  handleResourceLoadingStates,
  ResourceLoadingState,
} from "../../common/resource-loading"
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
export class AdminTicketgroupItemComponent implements OnChanges {
  private adminTicketgroupService = inject(AdminTicketgroupService)
  private router = inject(Router)
  private toastService = inject(ToastService)

  @Input()
  eventId!: string

  @Input()
  ticketgroupId!: string

  ticketgroup?: ApiTicketgroupAdmin & {
    event: ApiEventAdmin & {
      eventgroup: ApiEventgroupAdmin
    }
  }

  pageState = new ResourceLoadingState()

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["ticketgroupId"] || changes["eventId"]) {
      this.adminTicketgroupService
        .get(this.ticketgroupId)
        .pipe(handleResourceLoadingStates(this.pageState))
        .subscribe((data) => {
          if (String(data.event.id) !== this.eventId) {
            void this.router.navigateByUrl("/a")
            return
          }

          this.ticketgroup = data
        })
    }
  }

  updateTicketgroup() {
    this.adminTicketgroupService.update(this.ticketgroup!).subscribe({
      next: () => {
        void this.router.navigateByUrl(`/a/event/${this.ticketgroup!.event.id}`)
      },
      error: toastErrorHandler(this.toastService),
    })
  }

  deleteTicketgroup() {
    // TODO: no delete on valid/reserved tickets
    this.adminTicketgroupService.delete(this.ticketgroup!.id).subscribe({
      next: () => {
        void this.router.navigateByUrl(`/a/event/${this.ticketgroup!.event.id}`)
      },
      error: toastErrorHandler(this.toastService),
    })
  }
}
