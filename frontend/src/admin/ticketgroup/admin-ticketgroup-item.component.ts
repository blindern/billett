import { Component, inject, Input, OnInit } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { Router, RouterLink } from "@angular/router"
import {
  ApiEventAdmin,
  ApiEventgroupAdmin,
  ApiTicketgroupAdmin,
} from "../../apitypes"
import { FormatdatePipe } from "../../common/formatdate.pipe"
import { PagePropertyComponent } from "../../common/page-property.component"
import { PageStatesComponent } from "../../common/page-states.component"
import {
  handleResourceLoadingStates,
  ResourceLoadingState,
} from "../../common/resource-loading"
import { AdminTicketgroupService } from "./admin-ticketgroup.service"

@Component({
  selector: "admin-ticketgroup-item",
  standalone: true,
  imports: [
    PagePropertyComponent,
    FormatdatePipe,
    FormsModule,
    RouterLink,
    PageStatesComponent,
  ],
  templateUrl: "./admin-ticketgroup-item.component.html",
})
export class AdminTicketgroupItemComponent implements OnInit {
  private adminTicketgroupService = inject(AdminTicketgroupService)
  private router = inject(Router)

  @Input()
  eventId!: string

  @Input()
  ticketgroupId!: string

  ticketgroup?: ApiTicketgroupAdmin & {
    event: ApiEventAdmin & {
      eventgroup: ApiEventgroupAdmin
    }
  }

  pageState = new ResourceLoadingState()

  ngOnInit(): void {
    this.adminTicketgroupService
      .get(this.ticketgroupId)
      .pipe(handleResourceLoadingStates(this.pageState))
      .subscribe((data) => {
        if (String(data.event.id) !== this.eventId) {
          this.router.navigateByUrl("/a")
          return
        }

        this.ticketgroup = data
      })
  }

  updateTicketgroup() {
    this.adminTicketgroupService.update(this.ticketgroup!).subscribe({
      next: () => {
        this.router.navigateByUrl(`/a/event/${this.ticketgroup!.event.id}`)
      },
      error: (err) => {
        console.error(err)
        alert(err.message)
      },
    })
  }

  deleteTicketgroup() {
    // TODO: no delete on valid/reserved tickets
    this.adminTicketgroupService.delete(this.ticketgroup!.id).subscribe({
      next: () => {
        this.router.navigateByUrl(`/a/event/${this.ticketgroup!.event.id}`)
      },
      error: (err) => {
        console.error(err)
        alert(err.message)
      },
    })
  }
}
