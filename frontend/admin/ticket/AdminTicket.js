import ticketRevokeModalTemplate from "./ticket_revoke_modal.html?raw"

angular.module("billett.admin").factory("AdminTicket", function ($modal) {
  return {
    revokeModal: function (order, ticket) {
      return $modal.open({
        template: ticketRevokeModalTemplate,
        controller: "AdminTicketRevokeController as ctrl",
        resolve: {
          order: function () {
            return order
          },
          ticket: function () {
            return ticket
          },
        },
      })
    },
  }
})
