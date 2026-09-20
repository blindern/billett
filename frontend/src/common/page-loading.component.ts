import { ChangeDetectionStrategy, Component } from "@angular/core"

@Component({
  selector: "billett-page-loading",
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: "./page-loading.component.html",
})
export class PageLoadingComponent {}
