import { HttpErrorResponse } from "@angular/common/http"
import { ToastService } from "./toast.service"

function errorToText(error: unknown) {
  return error instanceof Error
    ? error.toString()
    : typeof error === "string"
      ? error
      : error != null &&
          typeof error === "object" &&
          "message" in error &&
          typeof error.message === "string"
        ? error.message
        : JSON.stringify(error)
}

export function getErrorText(error: unknown) {
  if (error instanceof HttpErrorResponse) {
    const errorText = errorToText(error.error)

    if (error.status === 400 || error.status === 0) {
      return errorText
    }

    return `${error.status}: ${errorText}`
  }

  if (error instanceof Error) {
    return errorToText(error)
  }

  return "Ukjent feil"
}

export function getValidationError(error: unknown): string | undefined {
  if (
    error instanceof HttpErrorResponse &&
    error.status === 400 &&
    typeof error.error === "string"
  ) {
    return error.error
  }
  return undefined
}

export function toastErrorHandler(
  toastService: ToastService,
  message = "Ukjent feil",
) {
  return (error: unknown) => {
    console.error("Error", error)
    toastService.show(`${message}: ${getErrorText(error)}`, {
      class: "danger",
    })
  }
}
