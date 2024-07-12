angular
  .module("billett.admin")
  .controller(
    "AdminPaymentgroupSelectController",
    ($http, $modalInstance, amount, order, actionText) => {
      var ctrl = this
      ctrl.order = order
      ctrl.actionText = actionText
      ctrl.amount = amount

      ctrl.complete = () => {
        $modalInstance.close(ctrl.paymentgroup)
      }

      ctrl.cancel = () => {
        $modalInstance.dismiss("cancel")
      }
    },
  )
