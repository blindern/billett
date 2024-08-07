import { Dialog } from "@angular/cdk/dialog"
import { CommonModule } from "@angular/common"
import {
  Component,
  inject,
  Input,
  OnChanges,
  SimpleChanges,
} from "@angular/core"
import { FormsModule } from "@angular/forms"
import { Router, RouterLink } from "@angular/router"
import { catchError, tap } from "rxjs"
import { api } from "../../api"
import { ApiTicketgroupAdmin } from "../../apitypes"
import { toastErrorHandler } from "../../common/errors"
import { FormatdatePipe } from "../../common/formatdate.pipe"
import { MarkdownComponent } from "../../common/markdown.component"
import { PagePropertyComponent } from "../../common/page-property.component"
import { PageStatesComponent } from "../../common/page-states.component"
import { PricePipe } from "../../common/price.pipe"
import {
  handleResourceLoadingStates,
  ResourceLoadingState,
} from "../../common/resource-loading"
import { ToastService } from "../../common/toast.service"
import { AdminPrinterSelectModal } from "../printer/admin-printer-select-modal.component"
import { AdminPrinterService } from "../printer/admin-printer.service"
import { AdminEventData, AdminEventService } from "./admin-event.service"

@Component({
  selector: "billett-admin-event",
  standalone: true,
  imports: [
    FormsModule,
    PageStatesComponent,
    PagePropertyComponent,
    RouterLink,
    FormatdatePipe,
    PricePipe,
    CommonModule,
    MarkdownComponent,
  ],
  templateUrl: "./admin-event.component.html",
  styleUrl: "./admin-event.component.scss",
})
export class AdminEventComponent implements OnChanges {
  private adminEventService = inject(AdminEventService)
  private toastService = inject(ToastService)
  private router = inject(Router)
  private adminPrinterService = inject(AdminPrinterService)
  private dialog = inject(Dialog)

  @Input()
  id!: string

  api = api

  pageState = new ResourceLoadingState()
  event?: AdminEventData

  image_version = ""
  uploadprogress = undefined

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["id"]) {
      this.adminEventService
        .get(this.id)
        .pipe(handleResourceLoadingStates(this.pageState))
        .subscribe((data) => {
          this.event = data
        })
    }
  }

  plus(a: string | number, b: string | number | null) {
    return Number(a) + Number(b)
  }

  deleteEvent() {
    if (this.event!.ticketgroups.length > 0) {
      this.toastService.show(
        "Du må først slette billettgruppene som er tilegnet.",
        {
          class: "danger",
        },
      )
      return
    }

    this.adminEventService.delete(this.event!.id).subscribe({
      next: () => {
        void this.router.navigateByUrl(
          "/a/eventgroup/" + this.event!.eventgroup.id,
        )
      },
      error: toastErrorHandler(this.toastService),
    })
  }

  moveTicketgroup(idx: number, direction: "up" | "down") {
    const groups = this.event!.ticketgroups
    this.event!.ticketgroups =
      direction === "up"
        ? [
            ...groups.slice(0, idx - 1),
            groups[idx],
            groups[idx - 1],
            ...groups.slice(idx + 1),
          ]
        : [
            ...groups.slice(0, idx),
            groups[idx + 1],
            groups[idx],
            ...groups.slice(idx + 2),
          ]

    this.adminEventService
      .setTicketgroupsOrder(
        this.event!.id,
        Object.fromEntries(
          this.event!.ticketgroups.map((g, index) => [g.id, index]),
        ),
      )
      .subscribe({
        error: toastErrorHandler(
          this.toastService,
          "Feil ved endring av rekkefølge",
        ),
      })
  }

  previewTicketPrint(ticketgroup: ApiTicketgroupAdmin) {
    AdminPrinterSelectModal.open(this.dialog, {
      handler: (printer) =>
        this.adminPrinterService.printPreviewTicket(printer, ticketgroup).pipe(
          tap(() => {
            this.toastService.show("Utskrift lagt i kø", {
              class: "success",
            })
          }),
          catchError((e) => {
            this.toastService.show("Ukjent feil oppsto!", {
              class: "warning",
            })
            throw e
          }),
        ),
    })
  }

  uploadImage(event: Event) {
    const fileInput = event.target as HTMLInputElement
    const file = fileInput.files![0]
    const formData = new FormData()
    formData.append("file", file)
    this.adminEventService.uploadImage(this.event!.id, formData).subscribe({
      next: () => {
        this.image_version = new Date().getTime().toString()
        fileInput.value = ""
      },
      error: toastErrorHandler(
        this.toastService,
        "Feil ved opplasting av bilde",
      ),
    })
  }
}
