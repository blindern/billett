import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  OnChanges,
  OnDestroy,
} from "@angular/core"
import { PageService } from "./page.service"

@Component({
  selector: "billett-page-property",
  standalone: true,
  imports: [],
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Eager,
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
