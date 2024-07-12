import {
  Directive,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  Renderer2,
  SimpleChanges,
} from "@angular/core"
import { Event, NavigationEnd, Router } from "@angular/router"
import { Subscription } from "rxjs"

@Directive({
  selector: "[activeFor]",
  exportAs: "activeFor",
  standalone: true,
})
export class ActiveFor implements OnChanges, OnDestroy {
  private paths: string[] = []
  private routerEventsSubscription: Subscription

  constructor(
    private router: Router,
    private element: ElementRef,
    private renderer: Renderer2,
  ) {
    this.routerEventsSubscription = router.events.subscribe((s: Event) => {
      if (s instanceof NavigationEnd) {
        this.update()
      }
    })
  }

  @Input()
  set activeFor(data: string[]) {
    this.paths = data
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.update()
  }

  ngOnDestroy(): void {
    this.routerEventsSubscription.unsubscribe()
  }

  private update(): void {
    if (!this.router.navigated) return

    queueMicrotask(() => {
      const hasActiveLinks = this.hasActiveLinks()

      if (hasActiveLinks) {
        this.renderer.addClass(this.element.nativeElement, "active")
      } else {
        this.renderer.removeClass(this.element.nativeElement, "active")
      }
    })
  }

  private hasActiveLinks(): boolean {
    const currentUrl = this.router.url

    for (const path of this.paths) {
      if (path.endsWith("*")) {
        if (currentUrl.startsWith(path.slice(0, -1))) {
          return true
        }
      } else {
        if (currentUrl === path) {
          return true
        }
      }
    }

    return false
  }
}
