angular.module('billett.admin').controller('AdminPaymentgroupNewController', function ($routeParams, $location, AdminEventgroup, AdminPaymentgroupService, Page) {
    var ctrl = this;

    var loader = Page.setLoading();
    AdminEventgroup.get({id: $routeParams['eventgroup_id']}, function (ret) {
        loader();

        ctrl.eventgroup = ret;
        ctrl.paymentgroup = new AdminPaymentgroupService;
        ctrl.paymentgroup.eventgroup_id = ret.id;

        ctrl.save = function () {
            if (ctrl.paymentgroup.title && ctrl.paymentgroup.title.length > 0) {
                ctrl.paymentgroup.$save(function (paymentgroup) {
                    $location.path('a/paymentgroup/' + paymentgroup.id);
                });
            }
        }
    });
});
