import {
  Component,
  inject,
  Input,
  OnChanges,
  SimpleChanges,
} from "@angular/core"
import { FormsModule } from "@angular/forms"
import { RouterLink } from "@angular/router"
import { ApiEventgroupAdmin } from "../../apitypes"
import { toastErrorHandler } from "../../common/errors"
import { NavigationService } from "../../common/navigation.service"
import { PagePropertyComponent } from "../../common/page-property.component"
import { PageStatesComponent } from "../../common/page-states.component"
import {
  handleResourceLoadingStates,
  ResourceLoadingState,
} from "../../common/resource-loading"
import { ToastService } from "../../common/toast.service"
import { AdminEventgroupService } from "./admin-eventgroup.service"

@Component({
  selector: "billett-admin-eventgroup-edit",
  standalone: true,
  imports: [
    FormsModule,
    PageStatesComponent,
    PagePropertyComponent,
    RouterLink,
  ],
  templateUrl: "./admin-eventgroup-edit.component.html",
})
export class AdminEventgroupEditComponent implements OnChanges {
  private adminEventgroupService = inject(AdminEventgroupService)
  private navigationService = inject(NavigationService)
  private toastService = inject(ToastService)

  @Input()
  id!: string

  pageState = new ResourceLoadingState()
  eventgroup?: ApiEventgroupAdmin

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["id"]) {
      this.adminEventgroupService
        .get(this.id)
        .pipe(handleResourceLoadingStates(this.pageState))
        .subscribe((data) => {
          this.eventgroup = data
        })
    }
  }

  storeEventgroup() {
    if (!this.eventgroup || !this.eventgroup.title) return

    this.adminEventgroupService.update(this.eventgroup).subscribe({
      next: (data) => {
        this.navigationService.goBackOrTo(`/a/eventgroup/${data.id}`)
      },
      error: toastErrorHandler(this.toastService),
    })
  }
}
