import { HttpErrorResponse } from "@angular/common/http"
import { Component, Input } from "@angular/core"
import { getErrorText } from "./errors"
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

  getErrorText = getErrorText

  get isNotFound() {
    return (
      this.state.error &&
      this.state.error instanceof HttpErrorResponse &&
      this.state.error.status === 404
    )
  }
}
