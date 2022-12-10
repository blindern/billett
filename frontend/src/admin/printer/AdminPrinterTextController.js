angular
  .module("billett.admin")
  .controller(
    "AdminPrinterTextController",
    function ($modalInstance, AdminPrinter, Page) {
      var ctrl = this

      ctrl.complete = function () {
        ctrl.sending = true
        AdminPrinter.printText(ctrl.printer.name, ctrl.text).then(
          function () {
            Page.toast("Utskrift lagt i kø", { class: "success" })
            $modalInstance.close()
          },
          function () {
            Page.toast("Ukjent feil oppsto!", { class: "warning" })
            delete ctrl.sending
          },
        )
      }

      ctrl.cancel = function () {
        $modalInstance.dismiss("cancel")
      }
    },
  )
