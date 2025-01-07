import { Pipe, PipeTransform } from "@angular/core"
import moment from "./moment"

@Pipe({
  name: "formatdate",
  standalone: true,
})
export class FormatdatePipe implements PipeTransform {
  transform(datetime: number, format: string): string {
    return moment.unix(datetime).format(format)
  }
}
