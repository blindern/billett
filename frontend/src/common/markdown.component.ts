import { Component, Input } from "@angular/core"
import DOMPurify from "dompurify"
import { marked } from "marked"

@Component({
  selector: "billett-markdown",
  standalone: true,
  template: `<div [innerHTML]="convertedData"></div>`,
})
export class MarkdownComponent {
  @Input("data")
  data!: string | null

  convertedData?: string

  ngOnChanges() {
    var md = marked.setOptions({})
    this.convertedData = DOMPurify.sanitize(md.parse(this.data ?? "") as string)
  }
}
