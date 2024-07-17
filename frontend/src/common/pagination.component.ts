import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from "@angular/core"

@Component({
  selector: "billett-pagination",
  standalone: true,
  imports: [],
  templateUrl: "./pagination.component.html",
})
export class PaginationComponent implements OnChanges {
  @Input()
  total!: number

  @Input()
  limit!: number

  @Input()
  page!: number

  @Output()
  changePage = new EventEmitter<number>()

  numPages!: number

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["total"] || changes["limit"]) {
      this.numPages = Math.ceil(this.total / this.limit)
    }
  }

  changePageHandler(event: Event, to: number) {
    event.preventDefault()

    if (to < 1 || to > this.numPages) return
    this.page = to
    this.changePage.emit(to)
  }
}
