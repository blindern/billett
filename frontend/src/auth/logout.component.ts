import { Component, OnInit } from "@angular/core"
import { firstValueFrom } from "rxjs"
import { api } from "../api"
import { AuthService } from "./auth.service"

@Component({
  standalone: true,
  template: "Logger ut",
})
export class LogoutComponent implements OnInit {
  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    firstValueFrom(this.auth.csrfToken$).then((csrfToken) => {
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
