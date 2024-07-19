import { Component, inject, Input, OnChanges, OnDestroy } from "@angular/core"
import { PageService } from "./page.service"

@Component({
  selector: "billett-page-property",
  standalone: true,
  imports: [],
  template: "",
})
export class PagePropertyComponent implements OnChanges, OnDestroy {
  @Input()
  name!: string

  @Input()
  value!: string

  private cleanups: (() => void)[] = []

  private pageService = inject(PageService)

  ngOnChanges(): void {
    const remove = this.pageService.set(this.name, this.value)
    this.cleanups.push(remove)
  }

  ngOnDestroy(): void {
    for (const item of this.cleanups) {
      item()
    }
  }
}
