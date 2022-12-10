angular
  .module("billett.admin")
  .controller(
    "AdminPaymentgroupSelectController",
    function ($http, $modalInstance, amount, order, actionText) {
      var ctrl = this
      ctrl.order = order
      ctrl.actionText = actionText
      ctrl.amount = amount

      ctrl.complete = function () {
        $modalInstance.close(ctrl.paymentgroup)
      }

      ctrl.cancel = function () {
        $modalInstance.dismiss("cancel")
      }
    },
  )
