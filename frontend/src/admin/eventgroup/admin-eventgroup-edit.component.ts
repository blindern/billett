import { Location } from "@angular/common"
import { Component, inject, Input, OnInit } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { Router, RouterLink } from "@angular/router"
import { catchError, NEVER } from "rxjs"
import { ApiEventgroupAdmin } from "../../apitypes"
import { PagePropertyComponent } from "../../common/page-property.component"
import { PageStatesComponent } from "../../common/page-states.component"
import { PageService } from "../../common/page.service"
import {
  handleResourceLoadingStates,
  ResourceLoadingState,
} from "../../common/resource-loading"
import { AdminEventgroupService } from "./admin-eventgroup.service"

@Component({
  selector: "admin-eventgroup-edit",
  standalone: true,
  imports: [
    FormsModule,
    PageStatesComponent,
    PagePropertyComponent,
    RouterLink,
  ],
  templateUrl: "./admin-eventgroup-edit.component.html",
})
export class AdminEventgroupEditComponent implements OnInit {
  private adminEventgroupService = inject(AdminEventgroupService)
  private pageService = inject(PageService)
  private router = inject(Router)
  private location = inject(Location)
  private history = inject(History)

  @Input()
  id!: string

  pageState = new ResourceLoadingState()
  eventgroup?: ApiEventgroupAdmin

  ngOnInit(): void {
    this.pageService.set("title", "Rediger arrangementgruppe")

    this.adminEventgroupService
      .get(this.id)
      .pipe(handleResourceLoadingStates(this.pageState))
      .subscribe((data) => {
        this.eventgroup = data
      })
  }

  storeEventgroup() {
    if (!this.eventgroup || !this.eventgroup.title) return

    this.adminEventgroupService
      .update(this.eventgroup)
      .pipe(
        catchError((err) => {
          alert(String(err))
          return NEVER
        }),
      )
      .subscribe((data) => {
        if (this.history.length > 1) {
          this.location.back()
        } else {
          this.router.navigateByUrl(`/a/eventgroup/${data.id}`)
        }
      })
  }
}
