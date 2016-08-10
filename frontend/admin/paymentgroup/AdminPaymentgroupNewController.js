angular.module('billett.admin').controller('AdminPaymentgroupNewController', function ($modalInstance, eventgroupId, AdminPaymentgroup) {
    var ctrl = this;

    ctrl.paymentgroup = new AdminPaymentgroup;
    ctrl.paymentgroup.eventgroup_id = eventgroupId;

    ctrl.complete = function () {
        ctrl.sending = true;
        ctrl.paymentgroup.$save(function (paymentgroup) {
            $modalInstance.close(paymentgroup);
        }, function (ret) {
            ctrl.sending = false;
            alert(ret);
        });
    };

    ctrl.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});
