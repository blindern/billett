import {
  Component,
  inject,
  Input,
  OnChanges,
  SimpleChanges,
} from "@angular/core"
import { FormsModule } from "@angular/forms"
import { Router, RouterLink } from "@angular/router"
import { ApiEventgroupAdmin } from "../../apitypes"
import { toastErrorHandler } from "../../common/errors"
import moment from "../../common/moment"
import { PagePropertyComponent } from "../../common/page-property.component"
import { PageStatesComponent } from "../../common/page-states.component"
import {
  handleResourceLoadingStates,
  ResourceLoadingState,
} from "../../common/resource-loading"
import { ToastService } from "../../common/toast.service"
import { AdminEventgroupService } from "../eventgroup/admin-eventgroup.service"
import { AdminDaythemeService } from "./admin-daytheme.service"

@Component({
  selector: "billett-admin-daytheme-create",
  standalone: true,
  imports: [
    PageStatesComponent,
    PagePropertyComponent,
    RouterLink,
    FormsModule,
  ],
  templateUrl: "./admin-daytheme-create.component.html",
})
export class AdminDaythemeCreateComponent implements OnChanges {
  private adminDaythemeService = inject(AdminDaythemeService)
  private adminEventgroupService = inject(AdminEventgroupService)
  private router = inject(Router)
  private toastService = inject(ToastService)

  @Input()
  eventgroupId!: string

  pageState = new ResourceLoadingState()
  eventgroup?: ApiEventgroupAdmin
  form = {
    title: "",
    date: "",
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["eventgroupId"]) {
      this.adminEventgroupService
        .get(this.eventgroupId)
        .pipe(handleResourceLoadingStates(this.pageState))
        .subscribe((data) => {
          this.eventgroup = data
        })
    }
  }

  storeDaytheme() {
    if (!this.form?.title || !this.form.date) return

    const date = moment(this.form.date, "YYYY-MM-DD").unix()
    if (!date) {
      this.toastService.show("Ugyldig dato", { class: "warning" })
      return
    }

    this.adminDaythemeService
      .create({
        eventgroup_id: this.eventgroup!.id,
        date,
        title: this.form.title,
      })
      .subscribe({
        next: () => {
          void this.router.navigateByUrl(`/a/eventgroup/${this.eventgroupId}`)
        },
        error: toastErrorHandler(this.toastService),
      })
  }
}
