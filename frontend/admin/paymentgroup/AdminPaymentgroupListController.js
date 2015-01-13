angular.module('billett.admin').controller('AdminPaymentgroupListController', function ($stateParams, AdminEventgroup, AdminPaymentgroup, Page) {
    var ctrl = this;

    var loader = Page.setLoading();
    AdminEventgroup.get({id: $stateParams['eventgroup_id']}, function (ret) {
        ctrl.eventgroup = ret;

        AdminPaymentgroup.query({filter: 'eventgroup_id='+ret.id}, function (groups) {
            loader();

            ctrl.paymentgroups = groups;
        });
    });
});
