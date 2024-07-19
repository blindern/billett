import { type Observable } from "rxjs"

export type ObservableType<T extends Observable<unknown>> =
  T extends Observable<infer U> ? U : never
