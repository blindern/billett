angular.module('billett.admin').config(function ($stateProvider) {
    $stateProvider
        .state('admin-order-new', {
            url: '/a/order/new/:id',
            templateUrl: 'assets/views/admin/order/new.html',
            controller: 'AdminOrderNewController as ctrl',
            resolve: {auth: 'AuthRequireResolver'},
            params: {
                'paymentgroup_id': null
            }
        })
        .state('admin-order', {
            url: '/a/order/:id',
            templateUrl: 'assets/views/admin/order/order.html',
            controller: 'AdminOrderController as ctrl',
            resolve: {auth: 'AuthRequireResolver'}
        })
        .state('admin-orders', {
            url: '/a/orders?eventgroup_id',
            templateUrl: 'assets/views/admin/order/index.html',
            controller: 'AdminOrderListController',
            resolve: {auth: 'AuthRequireResolver'},
            reloadOnSearch: false
        });
});
