import { LowerCasePipe, NgClass } from "@angular/common"
import { Component, inject, Injectable, Input } from "@angular/core"
import { EventType, Router, RouterLink } from "@angular/router"
import { filter } from "rxjs"
import { ApiEvent, ApiEventgroup } from "../../apitypes"
import { FormatdatePipe } from "../../common/formatdate.pipe"

@Injectable({
  providedIn: "root",
})
class CategoryColors {
  constructor(router: Router) {
    router.events
      .pipe(filter((it) => it.type === EventType.NavigationStart))
      .subscribe(() => {
        this.#categories = []
      })
  }

  #categories: string[] = []

  categoryNum(category: string) {
    let i = this.#categories.indexOf(category)
    if (i == -1) {
      i = this.#categories.push(category) - 1
    }
    return i
  }
}

@Component({
  selector: "billett-eventlist-item",
  standalone: true,
  imports: [FormatdatePipe, RouterLink, NgClass, LowerCasePipe],
  templateUrl: "./eventlist-item.component.html",
  styleUrl: "./eventlist-item.component.scss",
})
export class GuestEventlistItemComponent {
  private categoryColors = inject(CategoryColors)

  @Input()
  event!: ApiEvent

  @Input()
  eventgroup!: ApiEventgroup

  @Input()
  isUpcoming = false

  framed = window.top != window.self

  categoryNum(category: string) {
    return this.categoryColors.categoryNum(category)
  }
}
