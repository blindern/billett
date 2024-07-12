import { Location } from "@angular/common"
import { afterRender, Component, OnInit } from "@angular/core"
import { RouterLink, RouterOutlet } from "@angular/router"
import { authService } from "./auth/AuthService"
import { ActiveFor } from "./common/active-for"

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, RouterLink, ActiveFor],
  templateUrl: "./app.component.html",
})
export class AppComponent implements OnInit {
  title = "testbillett" // TODO(migrate)
  realname = ""
  username = ""
  isDevPage = false
  isLoggedIn = false
  isVippsTest = false
  loggedInButNoAccess = false
  isAdminPage = () => {
    return this.location.path().substring(0, 3) == "/a/"
  }

  loading = true // TODO(migrate)
  page404 = false // TODO(migrate)

  constructor(private location: Location) {
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
    authService.isVippsTest().then((res) => {
      if (res) this.isVippsTest = true
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
