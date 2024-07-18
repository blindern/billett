import {
  Component,
  inject,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from "@angular/core"
import { FormsModule } from "@angular/forms"
import { RouterLink } from "@angular/router"
import { catchError, NEVER } from "rxjs"
import { ApiEventgroupAdmin } from "../../apitypes"
import { NavigationService } from "../../common/navigation.service"
import { PagePropertyComponent } from "../../common/page-property.component"
import { PageStatesComponent } from "../../common/page-states.component"
import { PageService } from "../../common/page.service"
import {
  handleResourceLoadingStates,
  ResourceLoadingState,
} from "../../common/resource-loading"
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
export class AdminEventgroupEditComponent implements OnInit, OnChanges {
  private adminEventgroupService = inject(AdminEventgroupService)
  private pageService = inject(PageService)
  private navigationService = inject(NavigationService)

  @Input()
  id!: string

  pageState = new ResourceLoadingState()
  eventgroup?: ApiEventgroupAdmin

  ngOnInit(): void {
    this.pageService.set("title", "Rediger arrangementgruppe")
  }

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

    this.adminEventgroupService
      .update(this.eventgroup)
      .pipe(
        catchError((err) => {
          alert(String(err))
          return NEVER
        }),
      )
      .subscribe((data) => {
        this.navigationService.goBackOrTo(`/a/eventgroup/${data.id}`)
      })
  }
}
