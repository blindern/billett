import { Component, OnInit } from "@angular/core"
import { api } from "../api"
import { authService } from "./AuthService"

@Component({
  standalone: true,
  template: "Logger ut",
})
export class LogoutComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    authService.getCsrfToken().then((csrfToken) => {
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
