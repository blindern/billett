angular.module('billett.admin').controller('AdminEventgroupSellController', function (Page, $stateParams, AdminEventgroup) {
    var ctrl = this;
    Page.setTitle('Selg billetter');

    var loader = Page.setLoading();
    AdminEventgroup.get({id: $stateParams['id']}, function (ret) {
        loader();

        ctrl.eventgroup = ret;
    });
});
