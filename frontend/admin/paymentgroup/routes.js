angular.module('billett.admin').config(function ($routeProvider) {
    $routeProvider
        .when('/a/paymentgroup/:id', {
            templateUrl: 'assets/views/admin/paymentgroup/item.html',
            controller: 'AdminPaymentgroupItemController as ctrl',
            resolve: {auth: 'AuthRequireResolver'}
        })
        .when('/a/eventgroup/:eventgroup_id/paymentgroups', {
            templateUrl: 'assets/views/admin/paymentgroup/list.html',
            controller: 'AdminPaymentgroupListController as ctrl',
            resolve: {auth: 'AuthRequireResolver'}
        })
        .when('/a/eventgroup/:eventgroup_id/paymentgroup/new', {
            templateUrl: 'assets/views/admin/paymentgroup/new.html',
            controller: 'AdminPaymentgroupNewController as ctrl',
            resolve: {auth: 'AuthRequireResolver'}
        });
});
