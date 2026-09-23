import { ChangeDetectionStrategy, Component } from "@angular/core"

@Component({
  selector: "billett-page-loading",
  standalone: true,
  imports: [],
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: "./page-loading.component.html",
})
export class PageLoadingComponent {}
