angular.module('billett.admin').factory('AdminTicket', function ($modal) {
    return {
        revokeModal: function (order, ticket) {
            return $modal.open({
                templateUrl: 'assets/views/admin/ticket/ticket_revoke_modal.html',
                controller: 'AdminTicketRevokeController as ctrl',
                resolve: {
                    order: function () {
                        return order;
                    },
                    ticket: function () {
                        return ticket;
                    }
                }
            });
        }
    };
});
