angular.module('billett.admin').config(function ($stateProvider) {
    $stateProvider
        .state('admin-paymentgroup', {
            url: '/a/paymentgroup/:id',
            templateUrl: 'assets/views/admin/paymentgroup/item.html',
            controller: 'AdminPaymentgroupItemController as ctrl',
            resolve: {auth: 'AuthRequireResolver'}
        })
        .state('admin-paymentgroups', {
            url: '/a/eventgroup/:eventgroup_id/paymentgroups',
            templateUrl: 'assets/views/admin/paymentgroup/list.html',
            controller: 'AdminPaymentgroupListController as ctrl',
            resolve: {auth: 'AuthRequireResolver'}
        });
});
