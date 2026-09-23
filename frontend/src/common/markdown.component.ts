import { Component, input, resource } from "@angular/core"

@Component({
  selector: "billett-markdown",
  standalone: true,
  template: `<div [innerHTML]="html.value()"></div>`,
})
export class MarkdownComponent {
  data = input<string | null>()

  html = resource({
    params: () => this.data() ?? "",
    loader: async ({ params }) => {
      const [marked, DOMPurify] = await Promise.all([
        import("marked"),
        import("dompurify"),
      ])
      return DOMPurify.default.sanitize(
        marked.marked.setOptions({}).parse(params) as string,
      )
    },
  })
}
