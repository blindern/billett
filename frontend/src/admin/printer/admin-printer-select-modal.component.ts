import { Dialog, DIALOG_DATA, DialogRef } from "@angular/cdk/dialog"
import { Component, inject, signal } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { finalize, Observable } from "rxjs"
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

  data = inject<AdminPrinterSelectModalInput>(DIALOG_DATA)

  private dialogRef = inject(DialogRef<AdminPrinterSelectModalResult>)

  sending = signal(false)
  printer = signal<ApiPrinterAdmin | undefined>(undefined)

  complete() {
    this.sending.set(true)
    this.data
      .handler(this.printer()!)
      .pipe(
        finalize(() => {
          this.sending.set(false)
        }),
      )
      .subscribe(() => {
        this.dialogRef.close({
          completed: true,
        })
      })
  }

  cancel() {
    this.dialogRef.close()
  }
}
