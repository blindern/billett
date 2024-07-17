import { Component, inject, Input, OnInit } from "@angular/core"
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
export class AdminPaymentgroupListComponent implements OnInit {
  private adminEventgroupService = inject(AdminEventgroupService)
  private adminPaymentgroupService = inject(AdminPaymentgroupService)

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

  ngOnInit(): void {
    this.adminEventgroupService
      .get(this.eventgroupId)
      .pipe(handleResourceLoadingStates(this.eventgroupState))
      .subscribe((eventgroup) => {
        this.eventgroup = eventgroup
        this.#loadPaymentGroups(eventgroup.id)
      })
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
    this.adminPaymentgroupService
      .openCreateModal({
        eventgroupId: this.eventgroup!.id,
      })
      .closed.subscribe((paymentgroup) => {
        if (paymentgroup) {
          this.#loadPaymentGroups(this.eventgroup!.id)
        }
      })
  }
}
