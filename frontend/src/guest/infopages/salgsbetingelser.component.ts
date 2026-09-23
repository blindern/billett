import { ChangeDetectionStrategy, Component } from "@angular/core"
import { PagePropertyComponent } from "../../common/page-property.component"

@Component({
  selector: "billett-salgsbetingelser",
  standalone: true,
  imports: [PagePropertyComponent],
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: "./salgsbetingelser.component.html",
})
export class SalgsbetingelserComponent {}
