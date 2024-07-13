import { HttpErrorResponse } from "@angular/common/http"
import { catchError, Observable, of, tap } from "rxjs"

export class ResourceLoadingState {
  loading = true
  notfound = false
  error: Error | undefined
}

export function handleResourceLoadingStates<T>(state: ResourceLoadingState) {
  return (source: Observable<T>) =>
    source.pipe(
      catchError((err) => {
        console.warn(err)

        if (err instanceof HttpErrorResponse && err.status === 404) {
          state.notfound = true
        } else {
          state.error = err
        }

        state.loading = false

        return of()
      }),
      tap(() => {
        state.loading = false
      }),
    )
}
