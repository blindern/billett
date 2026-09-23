import { Component, OnInit } from "@angular/core"
import { api } from "../api"
import { PagePropertyComponent } from "../common/page-property.component"

@Component({
  selector: "billett-login",
  template: `
    <billett-page-property name="title" value="Logg inn" />
    <p>Går til logg inn side</p>
  `,
  imports: [PagePropertyComponent],
})
export class LoginComponent implements OnInit {
  ngOnInit(): void {
    window.location.href = api("saml2/login?returnTo=a")
  }
}
