angular.module('billett.admin').config(function ($stateProvider) {
    $stateProvider
        .state('admin-order', {
            url: '/a/order/:id',
            templateUrl: 'assets/views/admin/order/index.html',
            controller: 'AdminOrderController',
            resolve: {auth: 'AuthRequireResolver'}
        })
        .state('admin-orders', {
            url: '/a/orders',
            templateUrl: 'assets/views/admin/order/index.html',
            controller: 'AdminOrderListController',
            resolve: {auth: 'AuthRequireResolver'},
            reloadOnSearch: false
        });
});
