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
        })
        .state('admin-paymentgroup-new', {
            url: '/a/eventgroup/:eventgroup_id/paymentgroup/new',
            templateUrl: 'assets/views/admin/paymentgroup/new.html',
            controller: 'AdminPaymentgroupNewController as ctrl',
            resolve: {auth: 'AuthRequireResolver'},
            params: {
                'is_selling': null // if controller is run with this state, it will return to the selling page
            }
        });
});
