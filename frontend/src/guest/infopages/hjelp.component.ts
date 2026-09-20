import { ChangeDetectionStrategy, Component } from "@angular/core"
import { PagePropertyComponent } from "../../common/page-property.component"

@Component({
  selector: "billett-hjelp",
  standalone: true,
  imports: [PagePropertyComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: "./hjelp.component.html",
})
export class HjelpComponent {}
