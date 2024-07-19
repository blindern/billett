import { Dialog } from "@angular/cdk/dialog"
import {
  Component,
  inject,
  Input,
  OnChanges,
  SimpleChanges,
} from "@angular/core"
import { RouterLink } from "@angular/router"
import { ApiEventgroupAdmin, ApiPaymentgroupAdmin } from "../../apitypes"
import { FormatdatePipe } from "../../common/formatdate.pipe"
import { PagePropertyComponent } from "../../common/page-property.component"
import { PageStatesComponent } from "../../common/page-states.component"
import {
  composeResourceLoadingStates,
  handleResourceLoadingStates,
  ResourceLoadingState,
} from "../../common/resource-loading"
import { AdminEventgroupService } from "../eventgroup/admin-eventgroup.service"
import { AdminPaymentgroupCreateModal } from "./admin-paymentgroup-create-modal.component"
import { AdminPaymentgroupService } from "./admin-paymentgroup.service"

@Component({
  selector: "billett-admin-paymentgroup-list",
  standalone: true,
  imports: [
    PagePropertyComponent,
    RouterLink,
    PageStatesComponent,
    FormatdatePipe,
  ],
  templateUrl: "./admin-paymentgroup-list.component.html",
})
export class AdminPaymentgroupListComponent implements OnChanges {
  private adminEventgroupService = inject(AdminEventgroupService)
  private adminPaymentgroupService = inject(AdminPaymentgroupService)
  private dialog = inject(Dialog)

  @Input()
  eventgroupId!: string

  eventgroupState = new ResourceLoadingState()
  paymentgroupsState = new ResourceLoadingState()

  eventgroup?: ApiEventgroupAdmin
  paymentgroups?: ApiPaymentgroupAdmin[]

  get pageState() {
    return composeResourceLoadingStates(
      this.eventgroupState,
      this.paymentgroupsState,
    )
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["eventgroupId"]) {
      this.adminEventgroupService
        .get(this.eventgroupId)
        .pipe(handleResourceLoadingStates(this.eventgroupState))
        .subscribe((eventgroup) => {
          this.eventgroup = eventgroup
          this.#loadPaymentGroups(eventgroup.id)
        })
    }
  }

  #loadPaymentGroups(eventgroupId: number) {
    this.adminPaymentgroupService
      .list(eventgroupId)
      .pipe(handleResourceLoadingStates(this.paymentgroupsState))
      .subscribe((paymentgroups) => {
        this.paymentgroups = paymentgroups
      })
  }

  createNew() {
    AdminPaymentgroupCreateModal.open(this.dialog, {
      eventgroupId: this.eventgroup!.id,
    }).closed.subscribe((paymentgroup) => {
      if (paymentgroup) {
        this.#loadPaymentGroups(this.eventgroup!.id)
      }
    })
  }
}
