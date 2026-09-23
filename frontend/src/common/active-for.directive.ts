import { computed, Directive, inject, input } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { NavigationEnd, Router } from "@angular/router"
import { filter, map } from "rxjs"

@Directive({
  selector: "[billettActiveFor]",
  host: { "[class.active]": "isActive()" },
})
export class ActiveForDirective {
  private router = inject(Router)

  paths = input.required<string[]>({ alias: "billettActiveFor" })

  #url = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url),
    ),
  )

  isActive = computed(() => {
    const url = this.#url()
    if (url === undefined) return false
    return this.paths().some((path) =>
      path.endsWith("*") ? url.startsWith(path.slice(0, -1)) : url === path,
    )
  })
}
