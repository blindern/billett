import { Dialog } from "@angular/cdk/dialog"
import { AsyncPipe, Location } from "@angular/common"
import { Component, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import {
  EventType,
  NavigationEnd,
  Router,
  RouterLink,
  RouterOutlet,
} from "@angular/router"
import { filter, map } from "rxjs"
import { AuthService } from "./auth/auth.service"
import { ActiveForDirective } from "./common/active-for.directive"
import { ToastContainerComponent } from "./common/toast-container.component"

@Component({
  selector: "billett-app",
  imports: [
    RouterOutlet,
    RouterLink,
    ActiveForDirective,
    AsyncPipe,
    ToastContainerComponent,
  ],
  templateUrl: "./app.component.html",
})
export class AppComponent {
  private location = inject(Location)
  public authService = inject(AuthService)
  private router = inject(Router)
  private dialog = inject(Dialog)

  loggedInButNoAccess = toSignal(
    this.authService.authData$.pipe(map((it) => it.logged_in && !it.is_admin)),
    { initialValue: false },
  )

  isAdminPage = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.location.path().startsWith("/a/")),
    ),
    { initialValue: false },
  )

  constructor() {
    if (window.top != window.self) {
      document.body.classList.add("isInIframe")
    }

    this.authService.isDevPage$.subscribe((res) => {
      document.body.classList.toggle("dev-page", res)
    })

    // make sure modals close on state change
    this.router.events.subscribe((s) => {
      if (s.type === EventType.NavigationStart) {
        for (const dialog of this.dialog.openDialogs) {
          dialog.close()
        }
      }
    })
  }
}
