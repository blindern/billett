import { Dialog } from "@angular/cdk/dialog"
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from "@angular/core"
import { FormsModule } from "@angular/forms"
import { ApiPaymentgroupAdmin } from "../../apitypes"
import { FormatdatePipe } from "../../common/formatdate.pipe"
import { AdminPaymentgroupCreateModal } from "./admin-paymentgroup-create-modal.component"
import { AdminPaymentgroupService } from "./admin-paymentgroup.service"

@Component({
  selector: "billett-admin-paymentgroup-selectbox",
  standalone: true,
  imports: [FormsModule, FormatdatePipe],
  templateUrl: "./admin-paymentgroup-selectbox.component.html",
})
export class AdminPaymentgroupSelectboxComponent implements OnChanges {
  private adminPaymentgroupService = inject(AdminPaymentgroupService)
  private dialog = inject(Dialog)

  @Input()
  eventgroupId!: number

  @Input()
  paymentgroup?: ApiPaymentgroupAdmin

  @Output()
  paymentgroupChange = new EventEmitter<ApiPaymentgroupAdmin>()

  paymentgroups?: ApiPaymentgroupAdmin[]
  selectedPaymentgroupId = ""

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["eventgroupId"]) {
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
  }

  createNew() {
    AdminPaymentgroupCreateModal.open(this.dialog, {
      eventgroupId: this.eventgroupId,
    }).closed.subscribe((paymentgroup) => {
      if (paymentgroup) {
        this.paymentgroup = paymentgroup
        this.paymentgroups!.push(paymentgroup)
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
