import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from "@angular/core"
import { FormsModule } from "@angular/forms"
import { ApiPaymentgroupAdmin } from "../../apitypes"
import { FormatdatePipe } from "../../common/formatdate.pipe"
import { AdminPaymentgroupService } from "./admin-paymentgroup.service"

@Component({
  selector: "billett-admin-paymentgroup-selectbox",
  standalone: true,
  imports: [FormsModule, FormatdatePipe],
  templateUrl: "./admin-paymentgroup-selectbox.component.html",
})
export class AdminPaymentgroupSelectboxComponent implements OnInit {
  private paymentgroupService = inject(AdminPaymentgroupService)

  @Input()
  eventgroupId!: number

  @Input()
  paymentgroup?: ApiPaymentgroupAdmin

  @Output()
  paymentgroupChange = new EventEmitter<ApiPaymentgroupAdmin>()

  paymentgroups?: ApiPaymentgroupAdmin[]
  selectedPaymentgroupId = ""

  ngOnInit(): void {
    this.paymentgroups = undefined
    this.paymentgroupService
      .listValid(this.eventgroupId)
      .subscribe((paymentgroups) => {
        this.paymentgroups = paymentgroups

        const updated = this.paymentgroupService.getPreferredGroup(
          paymentgroups,
          this.paymentgroup ? this.paymentgroup.id : undefined,
        )
        this.selectedPaymentgroupId = updated?.id.toString() ?? ""

        if (this.paymentgroup?.id !== updated?.id) {
          this.paymentgroup = updated
          this.paymentgroupChange.emit(updated)
        }
      })
  }

  createNew() {
    this.paymentgroupService
      .createModal(this.eventgroupId)
      .subscribe((paymentgroup) => {
        if (paymentgroup) {
          this.paymentgroup = paymentgroup
          this.paymentgroupChange.emit(paymentgroup)
          this.selectedPaymentgroupId = paymentgroup.id.toString()
          this.paymentgroupService.setPreferredGroup(paymentgroup)
        }
      })
  }

  update() {
    const paymentgroup = this.selectedPaymentgroupId
      ? this.paymentgroups!.find(
          (it) => it.id === Number(this.selectedPaymentgroupId),
        )
      : undefined

    this.paymentgroup = paymentgroup
    this.paymentgroupChange.emit(paymentgroup)
    this.paymentgroupService.setPreferredGroup(paymentgroup)
  }
}
