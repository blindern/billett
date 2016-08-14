angular.module('billett.admin').factory('AdminTicket', function ($modal) {
    return {
        revokeModal: function (order, ticket) {
            return $modal.open({
                template: require('./ticket_revoke_modal.html'),
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
