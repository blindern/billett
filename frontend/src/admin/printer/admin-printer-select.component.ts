import { DIALOG_DATA, DialogRef } from "@angular/cdk/dialog"
import { Component, inject, Inject } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { Observable } from "rxjs"
import { ApiPrinterAdmin } from "../../apitypes"
import { AdminPrinterSelectboxComponent } from "./admin-printer-selectbox.component"

export interface AdminPrinterSelectComponentInput {
  handler: (printer: ApiPrinterAdmin) => Observable<unknown>
}

@Component({
  selector: "billett-admin-printer-select",
  standalone: true,
  imports: [AdminPrinterSelectboxComponent, FormsModule],
  templateUrl: "./admin-printer-select.component.html",
})
export class AdminPrinterSelectComponent {
  constructor(
    @Inject(DIALOG_DATA)
    public data: AdminPrinterSelectComponentInput,
  ) {}

  private dialogRef = inject(DialogRef)

  sending = false
  printer?: ApiPrinterAdmin

  complete() {
    this.sending = true
    this.data.handler(this.printer!).subscribe({
      next: () => {
        this.sending = false
        this.dialogRef.close(true)
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
