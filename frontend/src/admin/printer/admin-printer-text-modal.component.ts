import { Dialog, DialogRef } from "@angular/cdk/dialog"
import { Component, inject } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { ApiPrinterAdmin } from "../../apitypes"
import { ToastService } from "../../common/toast.service"
import { AdminPrinterSelectboxComponent } from "./admin-printer-selectbox.component"
import { AdminPrinterService } from "./admin-printer.service"

export interface AdminPrinterTextModalResult {
  completed: true
}

@Component({
  selector: "billett-admin-printer-text-modal",
  standalone: true,
  imports: [AdminPrinterSelectboxComponent, FormsModule],
  templateUrl: "./admin-printer-text-modal.component.html",
})
export class AdminPrinterTextModal {
  static open(dialog: Dialog) {
    return dialog.open<AdminPrinterTextModalResult>(AdminPrinterTextModal)
  }

  private dialogRef = inject(DialogRef<AdminPrinterTextModalResult>)
  private adminPrinterService = inject(AdminPrinterService)
  private toastService = inject(ToastService)

  sending = false
  printer?: ApiPrinterAdmin
  text = ""

  complete() {
    this.sending = true
    this.adminPrinterService
      .printText(this.printer!.name, this.text)
      .subscribe({
        next: () => {
          this.sending = false
          this.toastService.show("Utskrift lagt i kø", { class: "success" })
          this.dialogRef.close({
            completed: true,
          })
        },
        error: () => {
          this.sending = false
          this.toastService.show("Ukjent feil oppsto!", { class: "warning" })
        },
      })
  }

  cancel() {
    this.dialogRef.close()
  }
}
