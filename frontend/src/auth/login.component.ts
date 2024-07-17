import { Component, OnInit } from "@angular/core"
import { api } from "../api"

@Component({
  selector: "billett-login",
  standalone: true,
  template: "Går til logg inn side",
})
export class LoginComponent implements OnInit {
  ngOnInit(): void {
    window.location.href = api("saml2/login?returnTo=a")
  }
}
