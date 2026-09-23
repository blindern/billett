import { Injectable, signal } from "@angular/core"

export interface ToastInfo {
  id: number
  content: string
  type: "success" | "warning" | "danger"
  remove: () => void
  unsafeHtml: boolean
}

@Injectable({
  providedIn: "root",
})
export class ToastService {
  toasts = signal<ToastInfo[]>([])

  #counter = 0

  show(
    content: string,
    options?: {
      class?: "warning" | "success" | "danger"
      timeout?: number
      unsafeHtml?: boolean
    },
  ) {
    const id = ++this.#counter
    const remove = () => {
      this.toasts.update((toasts) => toasts.filter((it) => it.id !== id))
    }

    this.toasts.update((toasts) => [
      ...toasts,
      {
        id,
        content,
        type: options?.class ?? "success",
        remove,
        unsafeHtml: options?.unsafeHtml ?? false,
      },
    ])

    setTimeout(remove, options?.timeout ?? 4000)
  }
}
