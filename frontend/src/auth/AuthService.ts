import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core"
import { firstValueFrom, map, Observable, ReplaySubject } from "rxjs"
import { api } from "../api"

interface AuthInfo {
  logged_in: boolean
  user_roles: string[]
  user: {
    id: number
    username: string
    email: string
    realname: string
  } | null
  csrf_token: string
  is_dev: boolean
  is_vipps_test: boolean
  is_admin: boolean
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  #authData$ = new ReplaySubject<AuthInfo>(1)

  constructor(private http: HttpClient) {
    this.refreshAuthData()
  }

  get authData$(): Observable<AuthInfo> {
    return this.#authData$
  }

  async refreshAuthData() {
    const authData = await firstValueFrom(this.http.get<AuthInfo>(api("me")))
    this.#authData$.next(authData)
    return authData
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
