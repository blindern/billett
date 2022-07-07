angular
  .module("billett.admin")
  .controller(
    "AdminOrderEmailController",
    function ($modalInstance, $scope, order) {
      var ctrl = this
      ctrl.order = order

      ctrl.send = function () {
        ctrl.sending = true
        ctrl.order.sendEmail(ctrl.email, ctrl.text).then(
          function () {
            $modalInstance.close()
          },
          function () {
            alert("Ukjent feil oppsto")
            delete ctrl.sending
          },
        )
      }

      ctrl.cancel = function () {
        $modalInstance.dismiss("cancel")
      }
    },
  )
