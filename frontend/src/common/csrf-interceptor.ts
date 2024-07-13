import { HttpEvent, HttpHandlerFn, HttpRequest } from "@angular/common/http"
import { inject } from "@angular/core"
import { mergeMap, Observable, take } from "rxjs"
import { backendUrl } from "../api"
import { AuthService } from "../auth/auth.service"

export function csrfInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  // only add csrf-token to api-endpoint, but not /api/me
  if (req.url.startsWith(backendUrl) && !req.url.includes("api/me")) {
    const auth = inject(AuthService)
    return auth.csrfToken$.pipe(
      take(1),
      mergeMap((csrfToken) => {
        const newReq = req.clone({
          setHeaders: {
            "X-Csrf-Token": csrfToken,
          },
        })
        return next(newReq)
      }),
    )
  }

  return next(req)
}
