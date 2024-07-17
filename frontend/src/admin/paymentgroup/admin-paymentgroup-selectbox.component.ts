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
  private adminPaymentgroupService = inject(AdminPaymentgroupService)

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
    this.adminPaymentgroupService
      .listValid(this.eventgroupId)
      .subscribe((paymentgroups) => {
        this.paymentgroups = paymentgroups

        const updated = this.adminPaymentgroupService.getPreferredGroup(
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
    this.adminPaymentgroupService
      .openCreateModal({
        eventgroupId: this.eventgroupId,
      })
      .closed.subscribe((paymentgroup) => {
        if (paymentgroup) {
          this.paymentgroup = paymentgroup
          this.paymentgroupChange.emit(paymentgroup)
          this.selectedPaymentgroupId = paymentgroup.id.toString()
          this.adminPaymentgroupService.setPreferredGroup(paymentgroup)
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
    this.adminPaymentgroupService.setPreferredGroup(paymentgroup)
  }
}
