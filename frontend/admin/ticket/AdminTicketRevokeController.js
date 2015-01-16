angular.module('billett.admin').controller('AdminTicketRevokeController', function ($http, $modalInstance, order, ticket) {
    var ctrl = this;
    ctrl.order = order;
    ctrl.ticket = ticket;

    ctrl.revoke = function () {
        ctrl.sending = true;
        $http.post('api/ticket/' + ticket.id + '/revoke',  {
            'paymentgroup_id': ctrl.active_paymentgroup.id
        }).then(function () {
            $modalInstance.close();
        }, function () {
            alert("Ukjent feil oppsto");
            delete ctrl.sending;
        });
    };

    ctrl.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});
