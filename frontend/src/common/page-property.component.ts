import { Component, effect, inject, input } from "@angular/core"
import { PageService } from "./page.service"

@Component({
  selector: "billett-page-property",
  standalone: true,
  template: "",
})
export class PagePropertyComponent {
  name = input.required<string>()
  value = input.required<string>()

  constructor() {
    const pageService = inject(PageService)
    effect((onCleanup) => {
      onCleanup(pageService.set(this.name(), this.value()))
    })
  }
}
