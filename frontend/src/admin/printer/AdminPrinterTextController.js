angular
  .module("billett.admin")
  .controller(
    "AdminPrinterTextController",
    ($modalInstance, AdminPrinter, Page) => {
      var ctrl = this

      ctrl.complete = () => {
        ctrl.sending = true
        AdminPrinter.printText(ctrl.printer.name, ctrl.text).then(
          () => {
            Page.toast("Utskrift lagt i kø", { class: "success" })
            $modalInstance.close()
          },
          () => {
            Page.toast("Ukjent feil oppsto!", { class: "warning" })
            delete ctrl.sending
          },
        )
      }

      ctrl.cancel = () => {
        $modalInstance.dismiss("cancel")
      }
    },
  )
