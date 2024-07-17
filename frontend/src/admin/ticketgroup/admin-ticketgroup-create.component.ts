import { Component, inject, Input, OnInit } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { Router, RouterLink } from "@angular/router"
import { ApiEventAdmin, ApiEventgroupAdmin } from "../../apitypes"
import { FormatdatePipe } from "../../common/formatdate.pipe"
import { PagePropertyComponent } from "../../common/page-property.component"
import { PageStatesComponent } from "../../common/page-states.component"
import {
  handleResourceLoadingStates,
  ResourceLoadingState,
} from "../../common/resource-loading"
import { AdminEventService } from "../event/admin-event.service"
import { AdminTicketgroupService } from "./admin-ticketgroup.service"

@Component({
  selector: "billett-admin-ticketgroup-create",
  standalone: true,
  imports: [
    PagePropertyComponent,
    FormatdatePipe,
    FormsModule,
    RouterLink,
    PageStatesComponent,
  ],
  templateUrl: "./admin-ticketgroup-create.component.html",
})
export class AdminTicketgroupCreateComponent implements OnInit {
  private adminTicketgroupService = inject(AdminTicketgroupService)
  private adminEventService = inject(AdminEventService)
  private router = inject(Router)

  @Input()
  eventId!: string

  event?: ApiEventAdmin & {
    eventgroup: ApiEventgroupAdmin
  }

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

  pageState = new ResourceLoadingState()

  ngOnInit(): void {
    this.adminEventService
      .get(this.eventId)
      .pipe(handleResourceLoadingStates(this.pageState))
      .subscribe((data) => {
        this.event = data
      })
  }

  submit() {
    this.adminTicketgroupService
      .create({
        event_id: this.event!.id,
        ...this.form,
        fee: this.form.fee ?? 0,
      })
      .subscribe({
        next: () => {
          this.router.navigateByUrl(`/a/event/${this.event!.id}`)
        },
        error: (err) => {
          console.error(err)
          alert(err.message)
        },
      })
  }
}
