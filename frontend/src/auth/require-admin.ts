import { inject } from "@angular/core"
import { CanActivateFn } from "@angular/router"
import { firstValueFrom } from "rxjs"
import { api } from "../api"
import { AuthService } from "./AuthService"

// TODO(migrate): Map all AuthRequireResolver to this

export const requireAdmin: CanActivateFn = async (_route, state) => {
  const auth = inject(AuthService)
  const isLoggedIn = await firstValueFrom(auth.isLoggedIn$)
  if (!isLoggedIn) {
    window.location.href = api(
      `saml2/login?returnTo=${encodeURIComponent(state.url)}`,
    )
    return false
  }

  return await firstValueFrom(auth.isAdmin$)
}
