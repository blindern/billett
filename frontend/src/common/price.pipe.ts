import { Pipe, PipeTransform } from "@angular/core"

@Pipe({
  name: "price",
  standalone: true,
})
export class PricePipe implements PipeTransform {
  transform(
    amount: null | number | string,
    decimals?: number | boolean,
    in_nok?: boolean,
  ): string {
    if (typeof decimals == "boolean") {
      in_nok = decimals
      decimals = 0
    }

    function formatNumber(number: number, decimals: number) {
      const numberStr = number.toFixed(decimals) + ""
      const x = numberStr.split(".")
      let x1 = x[0]
      const x2 = x.length > 1 ? "," + x[1] : ""
      const rgx = /(\d+)(\d{3})/
      while (rgx.test(x1)) {
        x1 = x1.replace(rgx, "$1" + " " + "$2")
      }
      return x1 + x2
    }

    if (typeof decimals != "number") decimals = 0
    return (
      (in_nok ? "NOK " : "kr ") +
      formatNumber(
        typeof amount === "string" ? parseFloat(amount) : Number(amount),
        decimals,
      )
    )
  }
}
