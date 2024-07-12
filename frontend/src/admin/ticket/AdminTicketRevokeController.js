import { api } from "../../api"

angular
  .module("billett.admin")
  .controller(
    "AdminTicketRevokeController",
    ($http, $modalInstance, order, ticket) => {
      var ctrl = this
      ctrl.order = order
      ctrl.ticket = ticket

      ctrl.revoke = () => {
        ctrl.sending = true
        $http
          .post(api("ticket/" + ctrl.ticket.id + "/revoke"), {
            paymentgroup_id: ctrl.paymentgroup.id,
          })
          .then(
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
