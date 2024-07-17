import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from "@angular/core"
import { FormsModule } from "@angular/forms"
import { ApiPrinterAdmin } from "../../apitypes"
import { AdminPrinterService } from "./admin-printer.service"

@Component({
  selector: "billett-admin-printer-selectbox",
  standalone: true,
  imports: [FormsModule],
  templateUrl: "./admin-printer-selectbox.component.html",
})
export class AdminPrinterSelectboxComponent implements OnInit {
  private printerService = inject(AdminPrinterService)

  @Input()
  id?: string

  @Input()
  printer?: ApiPrinterAdmin

  @Input()
  canDisable?: boolean

  @Output()
  printerChange = new EventEmitter<ApiPrinterAdmin>()

  printers?: ApiPrinterAdmin[]
  selectedPrinterName = ""

  ngOnInit(): void {
    this.printers = undefined
    this.printerService.getList().subscribe((printers) => {
      this.printers = printers

      const updated = this.printerService.getPreferred(
        printers,
        this.printer ? this.printer.name : undefined,
      )
      this.selectedPrinterName = updated?.name ?? ""

      if (this.printer?.name !== updated?.name) {
        this.printer = updated
        this.printerChange.emit(updated)
      }
    })
  }

  getUptime(printer: ApiPrinterAdmin) {
    return Math.floor((printer.last_seen - printer.registered) / 60)
  }

  update() {
    const printer = this.selectedPrinterName
      ? this.printers!.find((it) => it.name === this.selectedPrinterName)
      : undefined

    this.printer = printer
    this.printerChange.emit(printer)
    this.printerService.setPreferred(printer)
  }
}
