import { api } from "../../api"

angular
  .module("billett.admin")
  .controller(
    "AdminPaymentAddController",
    ($http, $modalInstance, order) => {
      var ctrl = this
      ctrl.order = order
      ctrl.amount = -parseFloat(ctrl.order.balance)

      ctrl.register = () => {
        ctrl.sending = true
        $http
          .post(api("payment"), {
            order_id: ctrl.order.id,
            paymentgroup_id: ctrl.paymentgroup.id,
            amount: ctrl.amount,
          })
          .then(
            (res) => {
              $modalInstance.close(res)
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
