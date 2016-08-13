import {api} from '../../api';

angular.module('billett.admin').controller('AdminPaymentAddController', function ($http, $modalInstance, order) {
    var ctrl = this;
    ctrl.order = order;
    ctrl.amount = -parseFloat(ctrl.order.balance);

    ctrl.register = function () {
        ctrl.sending = true;
        $http.post(api('payment'),  {
            order_id: ctrl.order.id,
            paymentgroup_id: ctrl.paymentgroup.id,
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
