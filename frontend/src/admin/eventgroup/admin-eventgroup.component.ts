import { CommonModule } from "@angular/common"
import {
  Component,
  inject,
  Input,
  OnChanges,
  SimpleChanges,
} from "@angular/core"
import { FormsModule } from "@angular/forms"
import { RouterLink } from "@angular/router"
import {
  ApiEventAdmin,
  ApiEventgroupAdmin,
  ApiTicketgroupAdmin,
} from "../../apitypes"
import { toastErrorHandler } from "../../common/errors"
import { FormatdatePipe } from "../../common/formatdate.pipe"
import moment from "../../common/moment"
import { PagePropertyComponent } from "../../common/page-property.component"
import { PageStatesComponent } from "../../common/page-states.component"
import { PricePipe } from "../../common/price.pipe"
import {
  handleResourceLoadingStates,
  ResourceLoadingState,
} from "../../common/resource-loading"
import { ToastService } from "../../common/toast.service"
import { AdminEventService } from "../event/admin-event.service"
import { AdminEventgroupService } from "./admin-eventgroup.service"

@Component({
  selector: "billett-admin-eventgroup",
  standalone: true,
  imports: [
    PagePropertyComponent,
    RouterLink,
    FormsModule,
    CommonModule,
    FormatdatePipe,
    PricePipe,
    PageStatesComponent,
  ],
  templateUrl: "./admin-eventgroup.component.html",
  styleUrl: "./admin-eventgroup.component.scss",
})
export class AdminEventgroupComponent implements OnChanges {
  private adminEventgroupService = inject(AdminEventgroupService)
  private adminEventService = inject(AdminEventService)
  private toastService = inject(ToastService)

  @Input()
  id!: string

  pageState = new ResourceLoadingState()

  eventgroup?: ApiEventgroupAdmin & {
    events: (ApiEventAdmin & {
      ticketgroups: ApiTicketgroupAdmin[]
    })[]
  }
  filter_sale: "" | "0" | "1" = ""
  filter_category = ""
  filter_hidden: "" | "0" | "1" = ""
  categories: string[] = []
  days?: Record<
    string,
    (ApiEventAdmin & {
      ticketgroups: ApiTicketgroupAdmin[]
    })[]
  >

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["id"]) {
      this.adminEventgroupService
        .get(this.id)
        .pipe(handleResourceLoadingStates(this.pageState))
        .subscribe((data) => {
          this.eventgroup = data
          this.applyFilter()

          this.categories = []
          for (const event of this.eventgroup.events) {
            if (this.categories.includes(event.category ?? "")) continue
            this.categories.push(event.category ?? "")
          }
          this.categories.sort()
        })

      this.filter_sale = ""
      this.filter_category = "-1"
      this.filter_hidden = "0"
    }
  }

  applyFilter() {
    const r: NonNullable<this["days"]> = {}
    for (const item of this.eventgroup!.events) {
      if (
        this.filter_sale !== "" &&
        (this.filter_sale === "1") !== !!item.ticketgroups.length
      )
        continue
      if (
        this.filter_category !== "-1" &&
        this.filter_category != (item.category ?? "")
      )
        continue
      if (
        this.filter_hidden != "" &&
        (this.filter_hidden === "1") !== item.is_admin_hidden
      )
        continue

      const k = moment.unix(item.time_start - 3600 * 6).format("YYYY-MM-DD")
      r[k] = r[k] || []
      r[k].push(item)
    }

    this.days = r
  }

  eventTogglePublish(event: ApiEventAdmin) {
    this.adminEventService.setPublish(event.id, !event.is_published).subscribe({
      next: (data) => {
        event.is_published = data.is_published
      },
      error: toastErrorHandler(this.toastService),
    })
  }

  eventToggleSelling(event: ApiEventAdmin) {
    this.adminEventService.setSelling(event.id, !event.is_selling).subscribe({
      next: (data) => {
        event.is_selling = data.is_selling
      },
      error: toastErrorHandler(this.toastService),
    })
  }
}
