import { Component, inject } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { Router } from "@angular/router"
import { toastErrorHandler } from "../../common/errors"
import { PagePropertyComponent } from "../../common/page-property.component"
import { ToastService } from "../../common/toast.service"
import { AdminEventgroupService } from "./admin-eventgroup.service"

@Component({
  selector: "billett-admin-eventgroup-create",
  standalone: true,
  imports: [FormsModule, PagePropertyComponent],
  templateUrl: "./admin-eventgroup-create.component.html",
})
export class AdminEventgroupCreateComponent {
  private adminEventgroupService = inject(AdminEventgroupService)
  private router = inject(Router)
  private toastService = inject(ToastService)

  form = {
    title: "",
    is_active: false,
  }

  storeEventgroup() {
    if (!this.form.title) return

    this.adminEventgroupService.create(this.form).subscribe({
      next: (data) => {
        this.router.navigateByUrl(`/a/eventgroup/${data.id}`)
      },
      error: toastErrorHandler(this.toastService),
    })
  }
}
