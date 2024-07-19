import { Dialog } from "@angular/cdk/dialog"
import { AsyncPipe, Location } from "@angular/common"
import { afterRender, Component, inject, OnInit } from "@angular/core"
import {
  Event,
  EventType,
  Router,
  RouterLink,
  RouterOutlet,
} from "@angular/router"
import { AuthService } from "./auth/auth.service"
import { ActiveForDirective } from "./common/active-for.directive"
import { ToastContainerComponent } from "./common/toast-container.component"

@Component({
  selector: "billett-app",
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    ActiveForDirective,
    AsyncPipe,
    ToastContainerComponent,
  ],
  templateUrl: "./app.component.html",
})
export class AppComponent implements OnInit {
  private location = inject(Location)
  public authService = inject(AuthService)
  private router = inject(Router)
  private dialog = inject(Dialog)

  loggedInButNoAccess = false

  isAdminPage() {
    return this.location.path().startsWith("/a/")
  }

  constructor() {
    afterRender(() => {
      if (window.top != window.self) {
        document.body.classList.add("isInIframe")
      }
    })
  }

  ngOnInit(): void {
    this.authService.isDevPage$.subscribe((res) => {
      if (res) {
        document.body.classList.add("dev-page")
      } else {
        document.body.classList.remove("dev-page")
      }
    })
    this.authService.isLoggedIn$.subscribe((res) => {
      if (res) {
        this.authService.isAdmin$.subscribe((isAdmin) => {
          if (!isAdmin) {
            this.loggedInButNoAccess = true
          }
        })
      }
    })

    // make sure modals close on state change
    this.router.events.subscribe((s: Event) => {
      if (s.type === EventType.NavigationStart) {
        for (const dialog of this.dialog.openDialogs) {
          dialog.close()
        }
      }
    })
  }
}
