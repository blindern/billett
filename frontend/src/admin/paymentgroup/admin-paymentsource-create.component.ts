import { DIALOG_DATA, DialogRef } from "@angular/cdk/dialog"
import { Component, inject, Inject } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { NgxTypeAheadComponent } from "ngx-typeahead"
import {
  ApiEventgroupAdmin,
  ApiPaymentgroupAdmin,
  ApiPaymentsourceAdmin,
} from "../../apitypes"
import { PagePropertyComponent } from "../../common/page-property.component"
import { PageService } from "../../common/page.service"
import { PricePipe } from "../../common/price.pipe"
import { AdminPaymentsourceService } from "./admin-paymentsource.service"

export interface AdminPaymentsourceCreateComponentInput {
  paymentgroup: ApiPaymentgroupAdmin
  eventgroup: ApiEventgroupAdmin
}

@Component({
  selector: "billett-admin-paymentsource-create",
  standalone: true,
  imports: [
    PagePropertyComponent,
    PricePipe,
    FormsModule,
    NgxTypeAheadComponent,
  ],
  templateUrl: "./admin-paymentsource-create.component.html",
})
export class AdminPaymentsourceCreateComponent {
  constructor(
    @Inject(DIALOG_DATA)
    private data: AdminPaymentsourceCreateComponentInput,
  ) {
    this.loadMathjs()
  }

  private adminPaymentsourceService = inject(AdminPaymentsourceService)
  private pageService = inject(PageService)
  private dialogRef = inject(DialogRef<ApiPaymentsourceAdmin>)

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
      .subscribe({
        next: (paymentsource) => {
          this.sending = false
          this.pageService.toast("Registrering vellykket", { class: "success" })
          this.dialogRef.close(paymentsource)
        },
        error: (err) => {
          this.sending = false
          console.error(err)
          alert(err.message)
        },
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
      this.title = this.data.eventgroup.paymentsources_data["cash_prefix"] || ""
    }
  }

  get titleTemplates() {
    return (this.data.eventgroup.paymentsources_data["sources"] ?? []).map(
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
      this.pageService.toast("Du kan ikke registrere en negativ telling", {
        class: "danger",
      })
    }

    if (isNaN(this.otherParsedNumber)) {
      this.pageService.toast(
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
          this.pageService.toast(
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
        this.pageService.toast("Du kan ikke registrere en tom opptelling", {
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
