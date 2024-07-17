import { DIALOG_DATA, DialogRef } from "@angular/cdk/dialog"
import { Component, inject, Inject } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { RouterLink } from "@angular/router"
import {
  ApiEventAdmin,
  ApiEventgroupAdmin,
  ApiOrderAdmin,
  ApiPaymentgroupAdmin,
  ApiTicketAdmin,
  ApiTicketgroupAdmin,
} from "../../apitypes"
import { FormatdatePipe } from "../../common/formatdate.pipe"
import { PricePipe } from "../../common/price.pipe"
import { AdminPaymentgroupSelectboxComponent } from "../paymentgroup/admin-paymentgroup-selectbox.component"
import { AdminTicketService } from "./admin-ticket.service"

export interface AdminTicketRevokeComponentInput {
  order: ApiOrderAdmin & {
    eventgroup: ApiEventgroupAdmin
  }
  ticket: ApiTicketAdmin & {
    ticketgroup: ApiTicketgroupAdmin
    event: ApiEventAdmin
  }
}

@Component({
  selector: "billett-admin-ticket-revoke",
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    FormatdatePipe,
    PricePipe,
    AdminPaymentgroupSelectboxComponent,
  ],
  templateUrl: "./admin-ticket-revoke.component.html",
})
export class AdminTicketRevokeComponent {
  constructor(
    @Inject(DIALOG_DATA)
    public data: AdminTicketRevokeComponentInput,
  ) {}

  private dialogRef = inject(DialogRef)
  private ticketService = inject(AdminTicketService)

  sending = false

  paymentgroup?: ApiPaymentgroupAdmin

  submit() {
    this.sending = true
    this.ticketService
      .revoke(this.data.ticket.id, this.paymentgroup!.id)
      .subscribe({
        next: () => {
          this.sending = false
          this.dialogRef.close(true)
        },
        error: (err) => {
          this.sending = false
          console.error(err)
          alert(err.message)
        },
      })
  }

  cancel() {
    this.dialogRef.close()
  }
}
