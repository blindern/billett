import { Component, Input } from "@angular/core"
import { PageLoadingComponent } from "./page-loading.component"
import { PageNotFoundComponent } from "./page-not-found.component"
import { ResourceLoadingState } from "./resource-loading"

@Component({
  selector: "billett-page-states",
  standalone: true,
  imports: [PageLoadingComponent, PageNotFoundComponent],
  templateUrl: "./page-states.component.html",
})
export class PageStatesComponent {
  @Input()
  state!: ResourceLoadingState
}
