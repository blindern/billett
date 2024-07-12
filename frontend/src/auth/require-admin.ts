import { CanActivateFn } from "@angular/router"
import { authService } from "./AuthService"
import { api } from "../api"

// TODO(migrate): Map all AuthRequireResolver to this

export const requireAdmin: CanActivateFn = async (next, state) => {
  const isLoggedIn = await authService.isLoggedIn()
  if (!isLoggedIn) {
    window.location.href = api(
      `saml2/login?returnTo=${encodeURIComponent(state.url)}`,
    )
    return false
  }

  const hasRole = authService.hasRole("billett.admin")
  return hasRole
}
