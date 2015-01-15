angular.module('billett.admin').controller('AdminPaymentgroupSelectController', function ($http, $modalInstance, AdminPaymentgroup, amount, order, actionText) {
    var ctrl = this;
    ctrl.order = order;
    ctrl.actionText = actionText;
    ctrl.amount = amount;

    AdminPaymentgroup.getValid(ctrl.order.eventgroup.id).$promise.then(function (ret) {
        ctrl.paymentgroups = ret;
        ctrl.active_paymentgroup = AdminPaymentgroup.getPreferredGroup(ret);
    });

    ctrl.changePaymentgroup = function () {
        AdminPaymentgroup.setPreferredGroup(ctrl.active_paymentgroup);
    };

    ctrl.complete = function () {
        $modalInstance.close(ctrl.active_paymentgroup);
    };

    ctrl.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});
