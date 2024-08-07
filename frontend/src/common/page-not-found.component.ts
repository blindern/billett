import { Component, inject, OnDestroy, OnInit } from "@angular/core"
import { Meta } from "@angular/platform-browser"

@Component({
  selector: "billett-page-not-found",
  standalone: true,
  imports: [],
  templateUrl: "./page-not-found.component.html",
})
export class PageNotFoundComponent implements OnInit, OnDestroy {
  private meta = inject(Meta)

  ngOnInit(): void {
    this.meta.updateTag({ name: "prerender-status-code", content: "404" })
  }

  ngOnDestroy(): void {
    this.meta.removeTag("name='prerender-status-code'")
  }
}
