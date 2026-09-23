import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core"
import { api } from "../api"
import { PagePropertyComponent } from "../common/page-property.component"

@Component({
  selector: "billett-login",
  standalone: true,
  template: `
    <billett-page-property name="title" value="Logg inn" />
    <p>Går til logg inn side</p>
  `,
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [PagePropertyComponent],
})
export class LoginComponent implements OnInit {
  ngOnInit(): void {
    window.location.href = api("saml2/login?returnTo=a")
  }
}
