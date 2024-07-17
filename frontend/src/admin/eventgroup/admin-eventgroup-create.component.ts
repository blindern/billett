import { Component, inject, OnInit } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { Router } from "@angular/router"
import { catchError, NEVER } from "rxjs"
import { PageService } from "../../common/page.service"
import { AdminEventgroupService } from "./admin-eventgroup.service"

@Component({
  selector: "admin-eventgroup-create",
  standalone: true,
  imports: [FormsModule],
  templateUrl: "./admin-eventgroup-create.component.html",
})
export class AdminEventgroupCreateComponent implements OnInit {
  private adminEventgroupService = inject(AdminEventgroupService)
  private pageService = inject(PageService)
  private router = inject(Router)

  form = {
    title: "",
    is_active: false,
  }

  ngOnInit(): void {
    this.pageService.set("title", "Ny arrangementgruppe")
  }

  storeEventgroup() {
    if (!this.form.title) return

    this.adminEventgroupService
      .create(this.form)
      .pipe(
        catchError((err) => {
          alert(String(err))
          return NEVER
        }),
      )
      .subscribe((data) => {
        this.router.navigateByUrl(`/a/eventgroup/${data.id}`)
      })
  }
}
