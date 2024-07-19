import {
  Component,
  inject,
  Input,
  OnChanges,
  SimpleChanges,
} from "@angular/core"
import { Router, RouterLink } from "@angular/router"
import { api } from "../../api"
import { toastErrorHandler } from "../../common/errors"
import { FormatdatePipe } from "../../common/formatdate.pipe"
import { PagePropertyComponent } from "../../common/page-property.component"
import { PageStatesComponent } from "../../common/page-states.component"
import {
  handleResourceLoadingStates,
  ResourceLoadingState,
} from "../../common/resource-loading"
import { ToastService } from "../../common/toast.service"
import { AdminEventFormComponent } from "./admin-event-form.component"
import { AdminEventData, AdminEventService } from "./admin-event.service"

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
export class AdminEventEditComponent implements OnChanges {
  private adminEventService = inject(AdminEventService)
  private router = inject(Router)
  private toastService = inject(ToastService)

  @Input()
  id!: string

  api = api

  pageState = new ResourceLoadingState()
  event?: AdminEventData

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["id"]) {
      this.adminEventService
        .get(this.id)
        .pipe(handleResourceLoadingStates(this.pageState))
        .subscribe((data) => {
          this.event = data
        })
    }
  }

  storeEvent() {
    if (!this.event || isNaN(this.event.time_start)) return

    this.adminEventService.update(this.event).subscribe({
      next: () => {
        void this.router.navigateByUrl(`/a/event/${this.event!.id}`)
      },
      error: toastErrorHandler(this.toastService),
    })
  }
}
