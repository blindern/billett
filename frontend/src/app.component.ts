import { Location } from "@angular/common"
import { afterRender, Component, OnInit } from "@angular/core"
import { RouterLink, RouterOutlet } from "@angular/router"
import { authService } from "./auth/AuthService"
import { ActiveFor } from "./common/active-for"
import { PageService } from "./common/page.service"
import { PageNotFoundComponent } from "./guest/infopages/page-not-found.component"

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, RouterLink, ActiveFor, PageNotFoundComponent],
  templateUrl: "./app.component.html",
})
export class AppComponent implements OnInit {
  realname = ""
  username = ""
  isDevPage = false
  isLoggedIn = false
  loggedInButNoAccess = false
  isAdminPage = () => {
    return this.location.path().substring(0, 3) == "/a/"
  }

  constructor(
    private location: Location,
    public page: PageService,
  ) {
    afterRender(() => {
      if (window.top != window.self) {
        document.body.classList.add("isInIframe")
      }
    })
  }

  ngOnInit(): void {
    authService.isDevPage().then((res) => {
      if (res) {
        this.isDevPage = true
        document.body.classList.add("dev-page")
      }
    })
    authService.isLoggedIn().then((res) => {
      if (res) this.isLoggedIn = true
      if (res) {
        authService.hasRole("billett.admin").then((hasRole) => {
          if (!hasRole) {
            this.loggedInButNoAccess = true
          }
        })
      }
    })
    this.username = this.realname = ""
    authService.getUser().then((user) => {
      if (user) {
        this.username = user.username
        this.realname = user.realname
      }
    })
  }
}
