import { Component, inject, OnInit } from "@angular/core"
import { firstValueFrom } from "rxjs"
import { api } from "../api"
import { AuthService } from "./auth.service"

@Component({
  selector: "billett-logout",
  standalone: true,
  template: "Logger ut",
})
export class LogoutComponent implements OnInit {
  private authService = inject(AuthService)

  ngOnInit(): void {
    firstValueFrom(this.authService.csrfToken$).then((csrfToken) => {
      const form = document.createElement("form")
      form.method = "post"
      form.action = api(
        `saml2/logout?_token=${encodeURIComponent(
          csrfToken,
        )}&returnTo=${encodeURIComponent(window.location.origin + "/")}`,
      )
      document.body.append(form)
      form.submit()
    })
  }
}
