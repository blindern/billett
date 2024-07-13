import { Component, Input, OnInit } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { Router, RouterLink } from "@angular/router"
import moment from "moment"
import { catchError, of } from "rxjs"
import { PageStatesComponent } from "../../common/page-states.component"
import { PageService } from "../../common/page.service"
import {
  handleResourceLoadingStates,
  ResourceLoadingState,
} from "../../common/resource-loading"
import {
  AdminEventgroupData,
  AdminEventgroupService,
} from "../eventgroup/admin-eventgroup.service"
import { AdminDaythemeService } from "./admin-daytheme.service"

@Component({
  selector: "admin-daytheme",
  standalone: true,
  imports: [PageStatesComponent, RouterLink, FormsModule],
  templateUrl: "./admin-daytheme-create.component.html",
})
export class AdminDaythemeCreateComponent implements OnInit {
  @Input()
  eventgroupId!: string

  pageState = new ResourceLoadingState()
  eventgroup?: AdminEventgroupData
  form = {
    title: "",
    date: "",
  }

  constructor(
    private adminDaythemeService: AdminDaythemeService,
    private adminEventgroupService: AdminEventgroupService,
    private pageService: PageService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.pageService.set("title", "Ny temadag")
    this.adminEventgroupService
      .get(this.eventgroupId)
      .pipe(handleResourceLoadingStates(this.pageState))
      .subscribe((data) => {
        this.eventgroup = data
      })
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
