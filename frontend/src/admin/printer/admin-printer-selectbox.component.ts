import { Component, inject, input, model } from "@angular/core"
import { rxResource } from "@angular/core/rxjs-interop"
import { FormsModule } from "@angular/forms"
import { tap } from "rxjs"
import { ApiPrinterAdmin } from "../../apitypes"
import { getErrorText } from "../../common/errors"
import { AdminPrinterService } from "./admin-printer.service"

@Component({
  selector: "billett-admin-printer-selectbox",
  standalone: true,
  imports: [FormsModule],
  templateUrl: "./admin-printer-selectbox.component.html",
})
export class AdminPrinterSelectboxComponent {
  private adminPrinterService = inject(AdminPrinterService)

  getErrorText = getErrorText

  id = input<string>()
  printer = model<ApiPrinterAdmin>()
  canDisable = input(false)

  printers = rxResource({
    stream: () =>
      this.adminPrinterService.getList().pipe(
        tap((printers) => {
          const preferred = this.adminPrinterService.getPreferred(
            printers,
            this.printer()?.name,
          )
          if (this.printer()?.name !== preferred?.name) {
            this.printer.set(preferred)
          }
        }),
      ),
  })

  getUptime(printer: ApiPrinterAdmin) {
    return Math.floor((printer.last_seen - printer.registered) / 60)
  }

  select(name: string) {
    const printer = this.printers.value()?.find((it) => it.name === name)
    this.printer.set(printer)
    this.adminPrinterService.setPreferred(printer)
  }
}
