angular
  .module("billett.admin")
  .controller(
    "AdminOrderEmailController",
    ($modalInstance, $scope, order) => {
      var ctrl = this
      ctrl.order = order

      ctrl.send = () => {
        ctrl.sending = true
        ctrl.order.sendEmail(ctrl.email, ctrl.text).then(
          () => {
            $modalInstance.close()
          },
          () => {
            alert("Ukjent feil oppsto")
            delete ctrl.sending
          },
        )
      }

      ctrl.cancel = () => {
        $modalInstance.dismiss("cancel")
      }
    },
  )
