import { Component, EventEmitter, Input, Output } from "@angular/core"

@Component({
  selector: "billett-pagination",
  standalone: true,
  imports: [],
  templateUrl: "./pagination.component.html",
})
export class PaginationComponent {
  @Input()
  total!: number

  @Input()
  limit!: number

  @Input()
  page!: number

  @Output()
  changePage = new EventEmitter<number>()

  get numPages() {
    return Math.ceil(this.total / this.limit)
  }

  changePageHandler(event: Event, to: number) {
    event.preventDefault()

    if (to < 1 || to > this.numPages) return
    this.page = to
    this.changePage.emit(to)
  }
}
