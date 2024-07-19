import {
  Directive,
  ElementRef,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Renderer2,
} from "@angular/core"
import { Event, NavigationEnd, Router } from "@angular/router"
import { Subscription } from "rxjs"

@Directive({
  selector: "[activeFor]",
  exportAs: "activeFor",
  standalone: true,
})
export class ActiveFor implements OnInit, OnChanges, OnDestroy {
  private router = inject(Router)
  private element = inject(ElementRef)
  private renderer = inject(Renderer2)

  private paths: string[] = []
  private routerEventsSubscription!: Subscription

  @Input()
  set activeFor(data: string[]) {
    this.paths = data
  }

  ngOnInit() {
    this.routerEventsSubscription = this.router.events.subscribe((s: Event) => {
      if (s instanceof NavigationEnd) {
        this.update()
      }
    })
  }

  ngOnChanges(): void {
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
