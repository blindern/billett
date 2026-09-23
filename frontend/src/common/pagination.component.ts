import { Component, computed, input, output } from "@angular/core"

@Component({
  selector: "billett-pagination",
  templateUrl: "./pagination.component.html",
})
export class PaginationComponent {
  total = input.required<number>()
  limit = input.required<number>()
  page = input.required<number>()
  changePage = output<number>()

  numPages = computed(() => Math.ceil(this.total() / this.limit()))

  changePageHandler(event: Event, to: number) {
    event.preventDefault()
    if (to < 1 || to > this.numPages()) return
    this.changePage.emit(to)
  }
}
