import { inject } from "@angular/core"
import { CanActivateFn } from "@angular/router"
import { firstValueFrom } from "rxjs"
import { api } from "../api"
import { AuthService } from "./auth.service"

export const requireAdmin: CanActivateFn = async (_route, state) => {
  const authService = inject(AuthService)
  const isLoggedIn = await firstValueFrom(authService.isLoggedIn$)
  if (!isLoggedIn) {
    window.location.href = api(
      `saml2/login?returnTo=${encodeURIComponent(state.url)}`,
    )
    return false
  }

  return await firstValueFrom(authService.isAdmin$)
}
