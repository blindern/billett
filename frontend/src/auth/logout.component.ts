import { Component, inject, OnInit } from "@angular/core"
import { take } from "rxjs"
import { api } from "../api"
import { PagePropertyComponent } from "../common/page-property.component"
import { AuthService } from "./auth.service"

@Component({
  selector: "billett-logout",
  standalone: true,
  template: `
    <billett-page-property name="title" value="Logger ut" />
    <p>Logger ut</p>
  `,
  imports: [PagePropertyComponent],
})
export class LogoutComponent implements OnInit {
  private authService = inject(AuthService)

  ngOnInit(): void {
    this.authService.csrfToken$.pipe(take(1)).subscribe((csrfToken) => {
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
