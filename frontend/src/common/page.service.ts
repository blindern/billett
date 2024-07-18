import { DestroyRef, inject, Injectable } from "@angular/core"
import { Meta, Title } from "@angular/platform-browser"
import { Event, NavigationStart, Router } from "@angular/router"
import { ToastService } from "./toast.service"

@Injectable({
  providedIn: "root",
})
export class PageService {
  private metaService = inject(Meta)
  private titleService = inject(Title)
  private toastService = inject(ToastService)

  private attrs: Record<string, { val: string; isDefault?: boolean }[]> = {}
  public meta: Record<string, string> = {}

  constructor(router: Router, destroyRef: DestroyRef) {
    this.setDefault("url", this.#getAbsoluteUrl(router.url))

    const routerEventsSubscription = router.events.subscribe((s: Event) => {
      if (s instanceof NavigationStart) {
        this.setDefault("url", this.#getAbsoluteUrl(s.url))
      }
    })

    destroyRef.onDestroy(() => {
      routerEventsSubscription.unsubscribe()
    })
  }

  #getAbsoluteUrl(value: string) {
    return new URL(value, document.location.origin).href
  }

  #updateQueued = false

  #queueUpdate() {
    if (this.#updateQueued) {
      return
    }
    this.#updateQueued = true
    queueMicrotask(() => {
      this.#updateQueued = false
      this.#update()
    })
  }

  #update() {
    const named = (name: string, content: string | undefined) => {
      if (content === undefined) {
        this.metaService.removeTag(`name="${name}"`)
      } else {
        this.metaService.updateTag({ name, content })
      }
    }
    const prop = (name: string, content: string | undefined) => {
      if (content === undefined) {
        this.metaService.removeTag(`property="${name}"`)
      } else {
        this.metaService.updateTag({ property: name, content })
      }
    }

    const title = this.meta["title"] || "UKA på Blindern"
    this.titleService.setTitle(title)

    named("description", this.meta["description"])

    prop("og:title", title)
    prop("og:type", this.meta["ogType"] || "website")
    prop(
      "og:image",
      this.meta["ogImage"] ??
        this.meta["image"] ??
        document.location.origin + "/assets/graphics/uka_gul_pikto.gif",
    )
    prop("og:url", this.meta["url"])
    prop(
      "og:description",
      this.meta["ogDescription"] || this.meta["description"],
    )
  }

  // set the current property to last on stack
  #setActive(name: string) {
    if (this.attrs[name].length === 0) {
      delete this.meta[name]
    } else {
      this.meta[name] = this.attrs[name].at(-1)!.val
    }
    this.#queueUpdate()
  }

  /**
   * Return page title
   * @deprecated (use get method)
   */
  title() {
    return this.get("title")
  }

  /**
   * Set page title
   * @deprecated (use set method)
   */
  setTitle(newTitle: string) {
    this.set("title", newTitle)
    this.#queueUpdate()
  }

  /**
   * Set page property
   *
   * Call the return value to remove it
   */
  set(name: string, value: string) {
    const x = { val: value }

    if (!this.attrs[name]) this.attrs[name] = []
    this.attrs[name].push(x)
    this.#setActive(name)

    const cleanup = () => {
      for (let i = 0; i < this.attrs[name].length; i++) {
        if (this.attrs[name][i] == x) {
          this.attrs[name].splice(i, 1)
          this.#setActive(name)
          break
        }
      }
    }

    return cleanup
  }

  /**
   * Set default page property which will be used if no other property is set
   */
  setDefault(name: string, value: string) {
    if (!(name in this.attrs)) this.attrs[name] = []
    if (
      this.attrs[name].length == 0 ||
      !(this.attrs[name][0].isDefault || null)
    ) {
      this.attrs[name].unshift({ val: value, isDefault: true })
    } else {
      this.attrs[name][0].val = value
    }
    this.#setActive(name)
  }

  /**
   * Get page property
   */
  get(name: string) {
    if (this.meta[name]) {
      return this.meta[name]
    }
    return undefined
  }
}
