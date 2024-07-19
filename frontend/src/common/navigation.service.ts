import { Location } from "@angular/common"
import { inject, Injectable } from "@angular/core"
import { EventType, Router } from "@angular/router"

@Injectable({
  providedIn: "root",
})
export class NavigationService {
  private router = inject(Router)
  private location = inject(Location)

  private history: string[] = []

  constructor(router: Router) {
    router.events.subscribe((event) => {
      if (event.type === EventType.NavigationEnd) {
        this.history.push(event.urlAfterRedirects)
      }
    })
  }

  goBackOrTo(url: string) {
    if (this.history.length > 1) {
      this.history.pop()
      this.location.back()
    } else {
      void this.router.navigateByUrl(url)
    }
  }
}
