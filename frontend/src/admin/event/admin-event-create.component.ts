import {
  Component,
  inject,
  Input,
  OnChanges,
  SimpleChanges,
} from "@angular/core"
import { Router, RouterLink } from "@angular/router"
import { api } from "../../api"
import { ApiEventgroupAdmin } from "../../apitypes"
import { PagePropertyComponent } from "../../common/page-property.component"
import { PageStatesComponent } from "../../common/page-states.component"
import {
  handleResourceLoadingStates,
  ResourceLoadingState,
} from "../../common/resource-loading"
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
export class AdminEventCreateComponent implements OnChanges {
  private adminEventgroupService = inject(AdminEventgroupService)
  private adminEventService = inject(AdminEventService)
  private router = inject(Router)

  @Input()
  eventgroupId!: string

  api = api

  pageState = new ResourceLoadingState()
  eventgroup?: ApiEventgroupAdmin
  event?: AdminEventCreateData

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["eventgroupId"]) {
      this.adminEventgroupService
        .get(this.eventgroupId)
        .pipe(handleResourceLoadingStates(this.pageState))
        .subscribe((data) => {
          this.eventgroup = data
          this.event = {
            eventgroup_id: data.id,
            max_sales: 0,
            max_each_person: 10,
          }
        })
    }
  }

  storeEvent() {
    if (!this.event || !this.event.time_start || isNaN(this.event.time_start))
      return

    this.adminEventService.create(this.event).subscribe((data) => {
      this.router.navigateByUrl(`/a/event/${data.id}`)
    })
  }
}
