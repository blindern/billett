import ticketRevokeModalTemplate from "./ticket_revoke_modal.html?raw"

angular.module("billett.admin").factory("AdminTicket", ($modal) => {
  return {
    revokeModal: (order, ticket) => {
      return $modal.open({
        template: ticketRevokeModalTemplate,
        controller: "AdminTicketRevokeController as ctrl",
        resolve: {
          order: () => {
            return order
          },
          ticket: () => {
            return ticket
          },
        },
      })
    },
  }
})
