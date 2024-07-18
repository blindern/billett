import {
  Component,
  inject,
  Input,
  OnChanges,
  SimpleChanges,
} from "@angular/core"
import { FormsModule } from "@angular/forms"
import { Router, RouterLink } from "@angular/router"
import moment from "moment"
import { catchError, of } from "rxjs"
import { ApiEventgroupAdmin } from "../../apitypes"
import { PagePropertyComponent } from "../../common/page-property.component"
import { PageStatesComponent } from "../../common/page-states.component"
import {
  handleResourceLoadingStates,
  ResourceLoadingState,
} from "../../common/resource-loading"
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
    if (!this.form || !this.form.title || !this.form.date) return

    const date = moment(this.form.date, "YYYY-MM-DD").unix()
    if (!date) {
      alert("Ugyldig dato")
      return
    }

    this.adminDaythemeService
      .create({
        eventgroup_id: this.eventgroup!.id,
        date,
        title: this.form.title,
      })
      .pipe(
        catchError((err) => {
          alert(err)
          return of()
        }),
      )
      .subscribe(() => {
        this.router.navigateByUrl(`/a/eventgroup/${this.eventgroupId}`)
      })
  }
}
