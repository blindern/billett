import { HttpEvent, HttpHandlerFn, HttpRequest } from "@angular/common/http"
import { from, mergeMap, Observable } from "rxjs"
import { backendUrl } from "../api"
import { authService } from "../auth/AuthService"

export function csrfInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  // only add csrf-token to api-endpoint, but not /api/me
  if (req.url.startsWith(backendUrl) && !req.url.includes("api/me")) {
    return from(authService.getCsrfToken()).pipe(
      mergeMap((csrfToken) => {
        const newReq = req.clone({
          setHeaders: {
            "X-Csrf-Token": csrfToken,
          },
        })
        console.log({ newReq })
        return next(newReq)
      }),
    )
  }

  return next(req)
}
