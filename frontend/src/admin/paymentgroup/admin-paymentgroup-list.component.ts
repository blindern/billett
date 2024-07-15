import { Component, Input, OnInit } from "@angular/core"
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
  selector: "admin-paymentgroup-list",
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
  @Input()
  eventgroupId!: string

  eventgroupState = new ResourceLoadingState()
  paymentgroupsState = new ResourceLoadingState()

  eventgroup?: ApiEventgroupAdmin
  paymentgroups?: ApiPaymentgroupAdmin[]

  constructor(
    private adminEventgroupService: AdminEventgroupService,
    private adminPaymentgroupService: AdminPaymentgroupService,
  ) {}

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
    /* TODO(migrate)
    AdminPaymentgroup.newModal(ctrl.eventgroup.id).result.then(() => {
      loadPaymentgroups()
    })
    */
  }
}
