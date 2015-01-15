angular.module('billett.admin').controller('AdminPaymentgroupNewController', function ($state, $stateParams, $location, AdminEventgroup, AdminPaymentgroup, Page) {
    var ctrl = this;

    console.log("state", $stateParams);

    var loader = Page.setLoading();
    AdminEventgroup.get({id: $stateParams['eventgroup_id']}, function (ret) {
        loader();

        ctrl.eventgroup = ret;
        ctrl.paymentgroup = new AdminPaymentgroup;
        ctrl.paymentgroup.eventgroup_id = ret.id;

        ctrl.save = function () {
            if (ctrl.paymentgroup.title && ctrl.paymentgroup.title.length > 0) {
                ctrl.paymentgroup.$save(function (paymentgroup) {
                    if ($stateParams['is_selling']) {
                        $state.go('admin-order-new', {id: ctrl.eventgroup.id, paymentgroup_id: paymentgroup.id});
                    } else {
                        $location.path('a/paymentgroup/' + paymentgroup.id);
                    }
                });
            }
        };

        ctrl.abort = function () {
            if ($stateParams['is_selling']) {
                $state.go('admin-order-new', {id: ctrl.eventgroup.id});
            } else {
                $state.go('admin-paymentgroups', {eventgroup_id: ctrl.eventgroup.id});
            }
        };
    });
});
