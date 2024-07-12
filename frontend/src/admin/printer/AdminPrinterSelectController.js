angular
  .module("billett.admin")
  .controller(
    "AdminPrinterSelectController",
    ($modalInstance, AdminPrinter, Page, addHandler) => {
      var ctrl = this

      ctrl.complete = () => {
        ctrl.sending = true
        addHandler(ctrl.printer.name).then(
          () => {
            $modalInstance.close()
          },
          () => {
            delete ctrl.sending
          },
        )
      }

      ctrl.cancel = () => {
        $modalInstance.dismiss("cancel")
      }
    },
  )
