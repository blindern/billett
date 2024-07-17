import { Component, Input, OnInit } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { Router, RouterLink } from "@angular/router"
import { api } from "../../api"
import { FormatdatePipe } from "../../common/formatdate.pipe"
import { PagePropertyComponent } from "../../common/page-property.component"
import { PageStatesComponent } from "../../common/page-states.component"
import { PageService } from "../../common/page.service"
import {
  handleResourceLoadingStates,
  ResourceLoadingState,
} from "../../common/resource-loading"
import { AdminEventFormComponent } from "./admin-event-form.component"
import { AdminEventData, AdminEventService } from "./admin-event.service"

@Component({
  selector: "admin-event-edit",
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
export class AdminEventEditComponent implements OnInit {
  @Input()
  id!: string

  api = api

  pageState = new ResourceLoadingState()
  event?: AdminEventData

  constructor(
    private adminEventService: AdminEventService,
    private pageService: PageService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.pageService.set("title", "Rediger arrangement")

    this.adminEventService
      .get(this.id)
      .pipe(handleResourceLoadingStates(this.pageState))
      .subscribe((data) => {
        this.event = data
      })
  }

  storeEvent() {
    if (!this.event || isNaN(this.event.time_start)) return

    this.adminEventService.update(this.event).subscribe(() => {
      this.router.navigateByUrl(`/a/event/${this.event!.id}`)
    })
  }
}