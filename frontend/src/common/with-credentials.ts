import { HttpEvent, HttpHandlerFn, HttpRequest } from "@angular/common/http"
import { Observable } from "rxjs"
import { backendUrl } from "../api"

export function withCredentials(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  if (req.url.startsWith(backendUrl)) {
    return next(
      req.clone({
        withCredentials: true,
      }),
    )
  }

  return next(req)
}
