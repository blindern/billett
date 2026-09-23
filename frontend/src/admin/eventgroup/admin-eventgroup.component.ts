import { KeyValuePipe, NgClass } from "@angular/common"
import { Component, computed, inject, input, signal } from "@angular/core"
import { rxResource } from "@angular/core/rxjs-interop"
import { FormsModule } from "@angular/forms"
import { RouterLink } from "@angular/router"
import { ApiEventAdmin } from "../../apitypes"
import { toastErrorHandler } from "../../common/errors"
import { FormatdatePipe } from "../../common/formatdate.pipe"
import moment from "../../common/moment"
import { PagePropertyComponent } from "../../common/page-property.component"
import { PageStatesComponent } from "../../common/page-states.component"
import { PricePipe } from "../../common/price.pipe"
import { ToastService } from "../../common/toast.service"
import { AdminEventService } from "../event/admin-event.service"
import {
  AdminEventgroupData,
  AdminEventgroupService,
} from "./admin-eventgroup.service"

@Component({
  selector: "billett-admin-eventgroup",
  imports: [
    PagePropertyComponent,
    RouterLink,
    FormsModule,
    KeyValuePipe,
    NgClass,
    FormatdatePipe,
    PricePipe,
    PageStatesComponent,
  ],
  templateUrl: "./admin-eventgroup.component.html",
  styleUrl: "./admin-eventgroup.component.scss",
})
export class AdminEventgroupComponent {
  private adminEventgroupService = inject(AdminEventgroupService)
  private adminEventService = inject(AdminEventService)
  private toastService = inject(ToastService)

  id = input.required<string>()

  eventgroupResource = rxResource({
    params: () => this.id(),
    stream: ({ params }) => this.adminEventgroupService.get(params),
  })

  filter_sale = signal<"" | "0" | "1">("")
  filter_category = signal("-1")
  filter_hidden = signal<"" | "0" | "1">("0")

  categories = computed(() =>
    [
      ...new Set(
        (this.eventgroupResource.value()?.events ?? []).map(
          (event) => event.category ?? "",
        ),
      ),
    ].sort(),
  )

  days = computed(() => {
    const sale = this.filter_sale()
    const category = this.filter_category()
    const hidden = this.filter_hidden()
    const r: Record<string, AdminEventgroupData["events"]> = {}
    for (const item of this.eventgroupResource.value()?.events ?? []) {
      if (sale !== "" && (sale === "1") !== !!item.ticketgroups.length) continue
      if (category !== "-1" && category != (item.category ?? "")) continue
      if (hidden != "" && (hidden === "1") !== item.is_admin_hidden) continue

      const k = moment.unix(item.time_start - 3600 * 6).format("YYYY-MM-DD")
      ;(r[k] ??= []).push(item)
    }
    return r
  })

  #patchEvent(id: number, patch: Partial<ApiEventAdmin>) {
    this.eventgroupResource.update(
      (eventgroup) =>
        eventgroup && {
          ...eventgroup,
          events: eventgroup.events.map((event) =>
            event.id === id ? { ...event, ...patch } : event,
          ),
        },
    )
  }

  eventTogglePublish(event: ApiEventAdmin) {
    this.adminEventService.setPublish(event.id, !event.is_published).subscribe({
      next: (data) => {
        this.#patchEvent(event.id, { is_published: data.is_published })
      },
      error: toastErrorHandler(this.toastService),
    })
  }

  eventToggleSelling(event: ApiEventAdmin) {
    this.adminEventService.setSelling(event.id, !event.is_selling).subscribe({
      next: (data) => {
        this.#patchEvent(event.id, { is_selling: data.is_selling })
      },
      error: toastErrorHandler(this.toastService),
    })
  }
}
