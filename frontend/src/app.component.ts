import { AsyncPipe, Location } from "@angular/common"
import { afterRender, Component, OnInit } from "@angular/core"
import { RouterLink, RouterOutlet } from "@angular/router"
import { AuthService } from "./auth/auth.service"
import { ActiveFor } from "./common/active-for"

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, RouterLink, ActiveFor, AsyncPipe],
  templateUrl: "./app.component.html",
})
export class AppComponent implements OnInit {
  loggedInButNoAccess = false
  isAdminPage = () => {
    return this.location.path().substring(0, 3) == "/a/"
  }

  constructor(
    private location: Location,
    public auth: AuthService,
  ) {
    afterRender(() => {
      if (window.top != window.self) {
        document.body.classList.add("isInIframe")
      }
    })
  }

  ngOnInit(): void {
    this.auth.isDevPage$.subscribe((res) => {
      if (res) {
        document.body.classList.add("dev-page")
      } else {
        document.body.classList.remove("dev-page")
      }
    })
    this.auth.isLoggedIn$.subscribe((res) => {
      if (res) {
        this.auth.isAdmin$.subscribe((isAdmin) => {
          if (!isAdmin) {
            this.loggedInButNoAccess = true
          }
        })
      }
    })
  }
}
