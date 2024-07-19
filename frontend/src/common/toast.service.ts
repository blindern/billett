import { Injectable } from "@angular/core"

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
  toasts: ToastInfo[] = []

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
      for (const [idx, toast] of this.toasts.entries()) {
        if (toast.id === id) {
          this.toasts.splice(idx, 1)
          break
        }
      }
    }

    this.toasts.push({
      id,
      content,
      type: options?.class ?? "success",
      remove,
      unsafeHtml: options?.unsafeHtml ?? false,
    })

    setTimeout(remove, options?.timeout ?? 4000)
  }
}
