import { Component, Input } from "@angular/core"

@Component({
  selector: "billett-markdown",
  standalone: true,
  template: `<div [innerHTML]="convertedData"></div>`,
})
export class MarkdownComponent {
  @Input("data")
  data!: string | null

  convertedData?: string

  async update() {
    const [marked, DOMPurify] = await Promise.all([
      import("marked"),
      import("dompurify"),
    ])

    const md = marked.marked.setOptions({})
    this.convertedData = DOMPurify.default.sanitize(md.parse(this.data ?? "") as string)
  }

  ngOnChanges() {
    void this.update()
  }
}
