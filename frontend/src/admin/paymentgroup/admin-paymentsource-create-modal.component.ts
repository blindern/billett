import { Dialog, DIALOG_DATA, DialogRef } from "@angular/cdk/dialog"
import { Component, inject, Inject } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { NgxTypeAheadComponent } from "ngx-typeahead"
import { finalize } from "rxjs"
import {
  ApiEventgroupAdmin,
  ApiPaymentgroupAdmin,
  ApiPaymentsourceAdmin,
} from "../../apitypes"
import { toastErrorHandler } from "../../common/errors"
import { PagePropertyComponent } from "../../common/page-property.component"
import { PricePipe } from "../../common/price.pipe"
import { ToastService } from "../../common/toast.service"
import { AdminPaymentsourceService } from "./admin-paymentsource.service"

export interface AdminPaymentsourceCreateModalInput {
  paymentgroup: ApiPaymentgroupAdmin
  eventgroup: ApiEventgroupAdmin
}

export type AdminPaymentsourceCreateModalResult = ApiPaymentsourceAdmin

@Component({
  selector: "billett-admin-paymentsource-create-modal",
  standalone: true,
  imports: [
    PagePropertyComponent,
    PricePipe,
    FormsModule,
    NgxTypeAheadComponent,
  ],
  templateUrl: "./admin-paymentsource-create-modal.component.html",
})
export class AdminPaymentsourceCreateModal {
  static open(dialog: Dialog, data: AdminPaymentsourceCreateModalInput) {
    return dialog.open<
      AdminPaymentsourceCreateModalResult,
      AdminPaymentsourceCreateModalInput
    >(AdminPaymentsourceCreateModal, {
      data,
    })
  }

  constructor(
    @Inject(DIALOG_DATA)
    private data: AdminPaymentsourceCreateModalInput,
  ) {
    void this.loadMathjs()
  }

  private adminPaymentsourceService = inject(AdminPaymentsourceService)
  private toastService = inject(ToastService)
  private dialogRef = inject(DialogRef<AdminPaymentsourceCreateModalResult>)

  evaluate?: (value: string) => number

  private _type: "" | "cash" | "other" = ""

  sending = false

  multiply = 1
  cashitems = [1, 5, 10, 20, 50, 100, 200, 500, 1000]

  cashTexts: Record<string, string> = {}
  cashParsedNumbers: Record<string, number> = {}

  otherText = ""

  title = ""
  comment = ""

  private async loadMathjs() {
    const { evaluate } = await import("mathjs")
    this.evaluate = evaluate
  }

  complete() {
    if (!this.#validateInput() || this.type === "") {
      return
    }

    this.sending = true
    this.adminPaymentsourceService
      .create({
        paymentgroup_id: this.data.paymentgroup.id,
        title: this.title,
        amount: this.total,
        comment: this.comment,
        type: this.type,
        data: this.#getDataField() ?? null,
      })
      .pipe(
        finalize(() => {
          this.sending = false
        }),
      )
      .subscribe({
        next: (paymentsource) => {
          this.sending = false
          this.toastService.show("Registrering vellykket", { class: "success" })
          this.dialogRef.close(paymentsource)
        },
        error: toastErrorHandler(this.toastService),
      })
  }

  cancel() {
    this.dialogRef.close()
  }

  get type(): typeof this._type {
    return this._type
  }

  set type(value: typeof this._type) {
    this._type = value
    if (value == "cash") {
      this.title = this.data.eventgroup.paymentsources_data.cash_prefix || ""
    }
  }

  get titleTemplates() {
    return (this.data.eventgroup.paymentsources_data.sources ?? []).map(
      (it) => it.title,
    )
  }

  get otherParsedNumber() {
    try {
      return this.otherText === ""
        ? 0
        : this.evaluate!(this.otherText.replace(",", "."))
    } catch {
      return NaN
    }
  }

  get total() {
    let result = this.multiply * (this.otherParsedNumber || 0)

    if (this.type == "cash") {
      this.cashParsedNumbers = {}
      for (const [key, val] of Object.entries(this.cashTexts)) {
        if (val === "") continue
        try {
          this.cashParsedNumbers[key] = this.evaluate!(val.replace(",", "."))
        } catch {
          this.cashParsedNumbers[key] = NaN
        }
        result += this.cashParsedNumbers[key] * Number(key)
      }
    }

    return result
  }

  #validateInput() {
    const errorNeg = () => {
      this.toastService.show("Du kan ikke registrere en negativ telling", {
        class: "danger",
      })
    }

    if (isNaN(this.otherParsedNumber)) {
      this.toastService.show(
        "Feltet for " +
          (this.type == "cash" ? "annet " : "") +
          "beløp er feil utfylt",
        { class: "danger" },
      )
      return false
    }
    if (this.otherParsedNumber < 0) {
      errorNeg()
      return false
    }

    if (this.type == "cash") {
      let s = Math.abs(this.otherParsedNumber)
      Object.entries(this.cashParsedNumbers).forEach(([key, val]) => {
        if (isNaN(val)) {
          this.toastService.show(
            "Feltet for valør " + key + " er feil utfylt",
            {
              class: "danger",
            },
          )
          return
        }
        if (val < 0) {
          errorNeg()
          return
        }
        s += Math.abs(val)
      })

      if (s == 0) {
        this.toastService.show("Du kan ikke registrere en tom opptelling", {
          class: "danger",
        })
        return false
      }
    }

    return true
  }

  #getDataField() {
    if (this.type != "cash") return

    const result: Record<string, number> = {}
    for (const [key, val] of Object.entries(this.cashParsedNumbers)) {
      if (val == 0) continue
      result[key] = val * this.multiply
    }

    if (this.otherParsedNumber != 0) {
      result["other"] = this.otherParsedNumber * this.multiply
    }

    return result
  }
}
