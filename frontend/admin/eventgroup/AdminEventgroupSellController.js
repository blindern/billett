angular.module('billett.admin').controller('AdminEventgroupSellController', function (Page, $routeParams, AdminEventgroup) {
    var ctrl = this;
    Page.setTitle('Selg billetter');

    var loader = Page.setLoading();
    AdminEventgroup.get({id: $routeParams['id']}, function (ret) {
        loader();

        ctrl.eventgroup = ret;
    });
});
