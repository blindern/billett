import { HttpErrorResponse } from "@angular/common/http"
import { Component, computed, input } from "@angular/core"
import { getErrorText } from "./errors"
import { PageLoadingComponent } from "./page-loading.component"
import { PageNotFoundComponent } from "./page-not-found.component"

@Component({
  selector: "billett-page-states",
  standalone: true,
  imports: [PageLoadingComponent, PageNotFoundComponent],
  templateUrl: "./page-states.component.html",
})
export class PageStatesComponent {
  loading = input.required<boolean>()
  error = input<unknown>()

  getErrorText = getErrorText

  isNotFound = computed(() => {
    const error = this.error()
    return error instanceof HttpErrorResponse && error.status === 404
  })
}
