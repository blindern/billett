import { CommonModule } from "@angular/common"
import { Component, inject, OnInit } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { ActivatedRoute, Router, RouterLink } from "@angular/router"
import { debounce, of, Subject, timer } from "rxjs"
import { api } from "../../api"
import { toastErrorHandler } from "../../common/errors"
import { FormatdatePipe } from "../../common/formatdate.pipe"
import { PagePropertyComponent } from "../../common/page-property.component"
import { PaginationComponent } from "../../common/pagination.component"
import { PricePipe } from "../../common/price.pipe"
import { ToastService } from "../../common/toast.service"
import { AdminOrderData, AdminOrderService } from "./admin-order.service"

const searchInit = {
  page: 1,
  id: "",
  eventgroup_id: "",
  order_text_id: "",
  name: "",
  email: "",
  phone: "",
  status: "",
  ["tickets.id"]: "",
  ["tickets.key"]: "",
  ["tickets.event.id"]: "",
  ["tickets.event.title"]: "",
  ["payments.transaction_id"]: "",
}

@Component({
  selector: "billett-admin-order-list",
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    PagePropertyComponent,
    PaginationComponent,
    FormatdatePipe,
    PricePipe,
    CommonModule,
  ],
  templateUrl: "./admin-order-list.component.html",
})
export class AdminOrderListComponent implements OnInit {
  private adminOrderService = inject(AdminOrderService)
  private route = inject(ActivatedRoute)
  private router = inject(Router)
  private toastService = inject(ToastService)

  api = api

  curPage = 1
  search = structuredClone(searchInit)
  orders?: ReturnType<AdminOrderListComponent["parseOrdersList"]>

  search_status = [
    {
      id: "all",
      val: "Alle ordre",
    },
    {
      id: "res",
      val: "Kun reservasjoner",
    },
    {
      id: "normal",
      val: "Skjul reservasjoner",
    },
    {
      id: "unbal",
      val: "Ubalanserte",
    },
  ]

  #searchqueue = new Subject<"delayed" | "immediate">()

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.search = {
        ...searchInit,
        ...params,
      }
    })

    this.#searchqueue
      .pipe(debounce((value) => (value === "delayed" ? timer(3000) : of(null))))
      .subscribe((type) => {
        if (type === "delayed") {
          this.search.page = 1
        }

        this.adminOrderService
          .query({
            page: this.search.page,
            filter: this.genFilter(),
          })
          .subscribe({
            next: (data) => {
              this.orders = this.parseOrdersList(data)
            },
            error: toastErrorHandler(
              this.toastService,
              "Feil ved søk etter ordre",
            ),
          })
      })

    this.#searchqueue.next("immediate")
  }

  formChanged(event: Event) {
    const input = event.target as HTMLInputElement
    const immediate = input.name === "status"

    // Allow bindings to update first.
    if (immediate) {
      setTimeout(() => {
        this.#searchqueue.next("immediate")
      }, 0)
    } else {
      this.#searchqueue.next("delayed")
    }
  }
  immediateSearch() {
    this.#searchqueue.next("immediate")
  }

  private parseOrdersList(data: AdminOrderData) {
    return {
      ...data,
      result: data.result.map((order) => {
        let total_valid = 0
        let total_reserved = 0

        for (const ticket of order.tickets) {
          if (ticket.is_revoked) continue

          if (ticket.is_valid) {
            total_valid += ticket.ticketgroup.price + ticket.ticketgroup.fee
          } else {
            total_reserved += ticket.ticketgroup.price + ticket.ticketgroup.fee
          }
        }

        return {
          ...order,
          total_valid,
          total_reserved,
        }
      }),
    }
  }

  private genFilter() {
    const equals = [
      "eventgroup_id",
      "id",
      "order_text_id",
      "tickets.id",
      "tickets.key",
      "tickets.event.id",
      "payments.transaction_id",
    ]

    const queryParams: Record<string, string | null> = {}

    const r: string[] = []
    for (const [name, val] of Object.entries(this.search)) {
      queryParams[name] =
        name == "page" && val == 1 ? null : String(val) || null

      if (val == "" || name == "page") continue

      if (name == "status") {
        if (val == "res") r.push("is_valid=0") // TODO: ticket reservations
        if (val == "normal") r.push("is_valid=1")
        if (val == "unbal") r.push("balance!=0")
      } else if (equals.includes(name)) {
        r.push(name + "=" + val)
      } else {
        r.push(name + ":like:" + val + "%")
      }
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: "merge",
      replaceUrl: true,
    })

    return r.join(",")
  }
}
