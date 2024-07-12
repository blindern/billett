import { afterRender, Component } from "@angular/core"
import { RouterOutlet } from "@angular/router"

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: "./app.component.html",
})
export class AppComponent {
  title = "testbillett" // TODO(migrate)
  realname = "realname" // TODO(migrate)
  username = "username" // TODO(migrate)
  isDevPage = true // TODO(migrate)
  isLoggedIn = false // TODO(migrate)
  isAdminPage = false // TODO(migrate): !isAdminPage()

  loggedInButNoAccess = true // TODO(migrate)
  loading = true // TODO(migrate)
  page404 = false // TODO(migrate)

  constructor() {
    afterRender(() => {
      // TODO(migrate)
      document.body.classList.add("dev-page")
      // document.body.classList.add("isInIframe")
    })
  }
}
