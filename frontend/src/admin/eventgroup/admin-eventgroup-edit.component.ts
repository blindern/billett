import { Component, inject, input } from "@angular/core"
import { rxResource } from "@angular/core/rxjs-interop"
import { FormsModule } from "@angular/forms"
import { RouterLink } from "@angular/router"
import { toastErrorHandler } from "../../common/errors"
import { NavigationService } from "../../common/navigation.service"
import { PagePropertyComponent } from "../../common/page-property.component"
import { PageStatesComponent } from "../../common/page-states.component"
import { ToastService } from "../../common/toast.service"
import { AdminEventgroupService } from "./admin-eventgroup.service"

@Component({
  selector: "billett-admin-eventgroup-edit",
  imports: [
    FormsModule,
    PageStatesComponent,
    PagePropertyComponent,
    RouterLink,
  ],
  templateUrl: "./admin-eventgroup-edit.component.html",
})
export class AdminEventgroupEditComponent {
  private adminEventgroupService = inject(AdminEventgroupService)
  private navigationService = inject(NavigationService)
  private toastService = inject(ToastService)

  id = input.required<string>()

  eventgroupResource = rxResource({
    params: () => this.id(),
    stream: ({ params }) => this.adminEventgroupService.get(params),
  })

  storeEventgroup() {
    const eventgroup = this.eventgroupResource.value()
    if (!eventgroup?.title) return

    this.adminEventgroupService.update(eventgroup).subscribe({
      next: (data) => {
        this.navigationService.goBackOrTo(`/a/eventgroup/${data.id}`)
      },
      error: toastErrorHandler(this.toastService),
    })
  }
}
