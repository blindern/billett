import { Dialog, DIALOG_DATA, DialogRef } from "@angular/cdk/dialog"
import { Component, inject, Inject } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { Observable } from "rxjs"
import { ApiPrinterAdmin } from "../../apitypes"
import { AdminPrinterSelectboxComponent } from "./admin-printer-selectbox.component"

export interface AdminPrinterSelectModalInput {
  handler: (printer: ApiPrinterAdmin) => Observable<unknown>
}

export interface AdminPrinterSelectModalResult {
  completed: true
}

@Component({
  selector: "billett-admin-printer-select-modal",
  standalone: true,
  imports: [AdminPrinterSelectboxComponent, FormsModule],
  templateUrl: "./admin-printer-select-modal.component.html",
})
export class AdminPrinterSelectModal {
  static open(dialog: Dialog, data: AdminPrinterSelectModalInput) {
    return dialog.open<
      AdminPrinterSelectModalResult,
      AdminPrinterSelectModalInput
    >(AdminPrinterSelectModal, {
      data,
    })
  }

  constructor(
    @Inject(DIALOG_DATA)
    public data: AdminPrinterSelectModalInput,
  ) {}

  private dialogRef = inject(DialogRef<AdminPrinterSelectModalResult>)

  sending = false
  printer?: ApiPrinterAdmin

  complete() {
    this.sending = true
    this.data.handler(this.printer!).subscribe({
      next: () => {
        this.sending = false
        this.dialogRef.close({
          completed: true,
        })
      },
      error: () => {
        this.sending = false
      },
    })
  }

  cancel() {
    this.dialogRef.close()
  }
}
