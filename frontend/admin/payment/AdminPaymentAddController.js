angular.module('billett.admin').controller('AdminPaymentAddController', function ($http, $modalInstance, order, AdminPaymentgroup) {
    var ctrl = this;
    ctrl.order = order;
    ctrl.amount = -parseFloat(ctrl.order.balance);

    AdminPaymentgroup.getValid(ctrl.order.eventgroup.id).$promise.then(function (ret) {
        ctrl.paymentgroups = ret;
        ctrl.active_paymentgroup = AdminPaymentgroup.getPreferredGroup(ret);
    });

    ctrl.changePaymentgroup = function () {
        AdminPaymentgroup.setPreferredGroup(ctrl.active_paymentgroup);
    };

    ctrl.register = function () {
        ctrl.sending = true;
        $http.post('api/payment',  {
            order_id: ctrl.order.id,
            paymentgroup_id: ctrl.active_paymentgroup.id,
            amount: ctrl.amount
        }).then(function (res) {
            $modalInstance.close(res);
        }, function () {
            alert("Ukjent feil oppsto");
            delete ctrl.sending;
        });
    };

    ctrl.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});
