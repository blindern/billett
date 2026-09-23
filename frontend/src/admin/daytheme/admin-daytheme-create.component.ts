import { Component, inject, input } from "@angular/core"
import { rxResource } from "@angular/core/rxjs-interop"
import { FormsModule } from "@angular/forms"
import { Router, RouterLink } from "@angular/router"
import { toastErrorHandler } from "../../common/errors"
import moment from "../../common/moment"
import { PagePropertyComponent } from "../../common/page-property.component"
import { PageStatesComponent } from "../../common/page-states.component"
import { ToastService } from "../../common/toast.service"
import { AdminEventgroupService } from "../eventgroup/admin-eventgroup.service"
import { AdminDaythemeService } from "./admin-daytheme.service"

@Component({
  selector: "billett-admin-daytheme-create",
  imports: [
    PageStatesComponent,
    PagePropertyComponent,
    RouterLink,
    FormsModule,
  ],
  templateUrl: "./admin-daytheme-create.component.html",
})
export class AdminDaythemeCreateComponent {
  private adminDaythemeService = inject(AdminDaythemeService)
  private adminEventgroupService = inject(AdminEventgroupService)
  private router = inject(Router)
  private toastService = inject(ToastService)

  eventgroupId = input.required<string>()

  eventgroupResource = rxResource({
    params: () => this.eventgroupId(),
    stream: ({ params }) => this.adminEventgroupService.get(params),
  })

  form = {
    title: "",
    date: "",
  }

  storeDaytheme() {
    if (!this.form.title || !this.form.date) return

    const date = moment(this.form.date, "YYYY-MM-DD").unix()
    if (!date) {
      this.toastService.show("Ugyldig dato", { class: "warning" })
      return
    }

    this.adminDaythemeService
      .create({
        eventgroup_id: this.eventgroupResource.value()!.id,
        date,
        title: this.form.title,
      })
      .subscribe({
        next: () => {
          void this.router.navigateByUrl(`/a/eventgroup/${this.eventgroupId()}`)
        },
        error: toastErrorHandler(this.toastService),
      })
  }
}
