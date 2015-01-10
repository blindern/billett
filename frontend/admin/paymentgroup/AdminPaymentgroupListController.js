angular.module('billett.admin').controller('AdminPaymentgroupListController', function ($routeParams, AdminEventgroup, AdminPaymentgroupService, Page) {
    var ctrl = this;

    var loader = Page.setLoading();
    AdminEventgroup.get({id: $routeParams['eventgroup_id']}, function (ret) {
        ctrl.eventgroup = ret;

        AdminPaymentgroupService.query({filter: 'eventgroup_id='+ret.id}, function (groups) {
            loader();

            ctrl.paymentgroups = groups;
        });
    });
});
