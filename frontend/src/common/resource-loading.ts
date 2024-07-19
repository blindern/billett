import { catchError, Observable, of, tap } from "rxjs"

export class ResourceLoadingState {
  loading = true
  error: unknown
}

export function handleResourceLoadingStates<T>(state: ResourceLoadingState) {
  return (source: Observable<T>) =>
    source.pipe(
      catchError((error: unknown) => {
        console.warn(error)

        state.error = error
        state.loading = false

        return of()
      }),
      tap(() => {
        state.loading = false
      }),
    )
}

export function composeResourceLoadingStates(
  ...states: [ResourceLoadingState, ...ResourceLoadingState[]]
): ResourceLoadingState {
  return {
    loading: states.some((s) => s.loading),
    error: states.find((s) => s.error)?.error,
  }
}
