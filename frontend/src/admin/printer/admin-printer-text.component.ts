import { DialogRef } from "@angular/cdk/dialog"
import { Component, inject } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { ApiPrinterAdmin } from "../../apitypes"
import { PageService } from "../../common/page.service"
import { AdminPrinterSelectboxComponent } from "./admin-printer-selectbox.component"
import { AdminPrinterService } from "./admin-printer.service"

@Component({
  selector: "billett-admin-printer-text",
  standalone: true,
  imports: [AdminPrinterSelectboxComponent, FormsModule],
  templateUrl: "./admin-printer-text.component.html",
})
export class AdminPrinterTextComponent {
  private dialogRef = inject(DialogRef)
  private adminPrinterService = inject(AdminPrinterService)
  private pageService = inject(PageService)

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
          this.pageService.toast("Utskrift lagt i kø", { class: "success" })
          this.dialogRef.close(true)
        },
        error: () => {
          this.sending = false
          this.pageService.toast("Ukjent feil oppsto!", { class: "warning" })
        },
      })
  }

  cancel() {
    this.dialogRef.close()
  }
}
