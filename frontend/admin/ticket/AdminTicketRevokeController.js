angular.module('billett.admin').controller('AdminTicketRevokeController', function ($http, $modalInstance, order, ticket, AdminPaymentgroup) {
    var ctrl = this;
    ctrl.order = order;
    ctrl.ticket = ticket;

    AdminPaymentgroup.getValid(ctrl.order.eventgroup.id).$promise.then(function (ret) {
        ctrl.paymentgroups = ret;
        ctrl.active_paymentgroup = AdminPaymentgroup.getPreferredGroup(ret);
    });

    ctrl.changePaymentgroup = function () {
        AdminPaymentgroup.setPreferredGroup(ctrl.active_paymentgroup);
    };

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
