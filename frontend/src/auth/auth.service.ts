import { HttpClient } from "@angular/common/http"
import { inject, Injectable } from "@angular/core"
import { map, Observable, ReplaySubject } from "rxjs"
import { api } from "../api"
import { ApiAuthInfo } from "../apitypes"
import { toastErrorHandler } from "../common/errors"
import { ToastService } from "../common/toast.service"

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private http = inject(HttpClient)
  private toastService = inject(ToastService)

  #authData$ = new ReplaySubject<ApiAuthInfo>(1)

  constructor() {
    this.refreshAuthData()
  }

  get authData$(): Observable<ApiAuthInfo> {
    return this.#authData$
  }

  refreshAuthData() {
    this.http.get<ApiAuthInfo>(api("me")).subscribe({
      next: (authData) => {
        this.#authData$.next(authData)
      },
      error: toastErrorHandler(this.toastService, "Feilet å hente brukerinfo"),
    })
  }

  get isLoggedIn$() {
    return this.authData$.pipe(map((it) => it.logged_in))
  }

  get isAdmin$() {
    return this.authData$.pipe(map((it) => it.is_admin))
  }

  get user$() {
    return this.authData$.pipe(map((it) => it.user))
  }

  get csrfToken$() {
    return this.authData$.pipe(map((it) => it.csrf_token))
  }

  get isDevPage$() {
    return this.authData$.pipe(map((it) => it.is_dev))
  }

  get isVippsTest$() {
    return this.authData$.pipe(map((it) => it.is_vipps_test))
  }
}
