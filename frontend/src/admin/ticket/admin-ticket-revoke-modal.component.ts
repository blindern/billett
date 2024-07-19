import { Dialog, DIALOG_DATA, DialogRef } from "@angular/cdk/dialog"
import { Component, inject, Inject } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { RouterLink } from "@angular/router"
import { finalize } from "rxjs"
import {
  ApiEventAdmin,
  ApiEventgroupAdmin,
  ApiOrderAdmin,
  ApiPaymentgroupAdmin,
  ApiTicketAdmin,
  ApiTicketgroupAdmin,
} from "../../apitypes"
import { toastErrorHandler } from "../../common/errors"
import { FormatdatePipe } from "../../common/formatdate.pipe"
import { PricePipe } from "../../common/price.pipe"
import { ToastService } from "../../common/toast.service"
import { AdminPaymentgroupSelectboxComponent } from "../paymentgroup/admin-paymentgroup-selectbox.component"
import { AdminTicketService } from "./admin-ticket.service"

export interface AdminTicketRevokeModalInput {
  order: ApiOrderAdmin & {
    eventgroup: ApiEventgroupAdmin
  }
  ticket: ApiTicketAdmin & {
    ticketgroup: ApiTicketgroupAdmin
    event: ApiEventAdmin
  }
}

export interface AdminTicketRevokeModalResult {
  completed: true
}

@Component({
  selector: "billett-admin-ticket-revoke-modal",
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    FormatdatePipe,
    PricePipe,
    AdminPaymentgroupSelectboxComponent,
  ],
  templateUrl: "./admin-ticket-revoke-modal.component.html",
})
export class AdminTicketRevokeModal {
  static open(dialog: Dialog, data: AdminTicketRevokeModalInput) {
    return dialog.open<
      AdminTicketRevokeModalResult,
      AdminTicketRevokeModalInput
    >(AdminTicketRevokeModal, {
      data,
    })
  }

  constructor(
    @Inject(DIALOG_DATA)
    public data: AdminTicketRevokeModalInput,
  ) {}

  private dialogRef = inject(DialogRef<AdminTicketRevokeModalResult>)
  private adminTicketService = inject(AdminTicketService)
  private toastService = inject(ToastService)

  sending = false

  paymentgroup?: ApiPaymentgroupAdmin

  submit() {
    this.sending = true
    this.adminTicketService
      .revoke(this.data.ticket.id, this.paymentgroup!.id)
      .pipe(
        finalize(() => {
          this.sending = false
        }),
      )
      .subscribe({
        next: () => {
          this.dialogRef.close({
            completed: true,
          })
        },
        error: toastErrorHandler(this.toastService),
      })
  }

  cancel() {
    this.dialogRef.close()
  }
}
