import { Injectable, OnDestroy } from "@angular/core"
import { Meta, Title } from "@angular/platform-browser"
import { Event, NavigationStart, Router } from "@angular/router"
import { Subscription } from "rxjs"

@Injectable({
  providedIn: "root",
})
export class PageService implements OnDestroy {
  private routerEventsSubscription: Subscription

  private activeLoader?: PromiseWithResolvers<any>
  private attrs = {}
  public meta = {}
  public loading = false
  public page404 = false

  constructor(
    private router: Router,
    private metaService: Meta,
    private titleService: Title,
  ) {
    // TODO(migrate): absolute urls
    this.setDefault("url", router.url)
    this.routerEventsSubscription = router.events.subscribe((s: Event) => {
      if (s instanceof NavigationStart) {
        this.loading = false
        this.setDefault("url", s.url)
      }
    })
  }

  ngOnDestroy(): void {
    this.routerEventsSubscription.unsubscribe()
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
      this.meta[name] = this.attrs[name].at(-1).val
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
   * Set page property, optionally connected to scope so it will be removed when scope is destroyed
   *
   * Call the return value to remove it manually
   */
  set(name, value, bind_scope?) {
    var x = { val: value }

    if (!this.attrs[name]) this.attrs[name] = []
    this.attrs[name].push(x)
    this.#setActive(name)

    var removeMe = () => {
      for (var i = 0; i < this.attrs[name].length; i++) {
        if (this.attrs[name][i] == x) {
          this.attrs[name].splice(i, 1)
          this.#setActive(name)
          break
        }
      }
    }

    if (bind_scope) {
      bind_scope.$on("$destroy", removeMe)
    }

    return removeMe
  }

  /**
   * Set default page property which will be used if no other property is set
   */
  setDefault(name, value) {
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
  get(name) {
    if (this.meta[name]) {
      return this.meta[name]
    }
  }

  /**
   * Add page toast
   */
  toast(text: string, params?: Record<string, any>) {
    // TODO(migrate): re-implement toasts
    console.log("toast", {
      ...params,
      content: text,
    })
  }

  /**
   * Set page as loading and return function to call when loading completes
   */
  setLoading() {
    const thisLoader = (this.activeLoader = Promise.withResolvers())

    this.loading = true
    return () => {
      if (thisLoader == this.activeLoader) {
        console.log("correct loader")
        thisLoader.resolve(null)
        this.activeLoader = undefined
        this.loading = false
      } else {
        console.log("incorrect loader")
        thisLoader.reject()
      }
    }
  }

  /**
   * Get loader promise if it exists
   */
  getPageLoaderPromise() {
    return this.activeLoader?.promise
  }

  /**
   * Set current page as 404
   *
   * Used on matched routes where the controller don't find it's resources
   */
  set404() {
    this.page404 = true
    var title = this.set("title", "404 Page not found")

    const sub = this.router.events.subscribe((s: Event) => {
      if (s instanceof NavigationStart) {
        this.page404 = false
        title() // remove title from stack
        sub.unsubscribe()
      }
    })
  }
}