import { Component, Input } from "@angular/core"
import DOMPurify from "dompurify"
import { marked } from "marked"

@Component({
  selector: "markdown",
  standalone: true,
  template: `<div [innerHTML]="convertedData"></div>`,
})
export class MarkdownComponent {
  @Input("data")
  data!: string

  convertedData?: string

  ngOnChanges() {
    var md = marked.setOptions({})
    this.convertedData = DOMPurify.sanitize(md.parse(this.data) as string)
  }
}
