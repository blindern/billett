angular.module('billett.admin').config(function ($routeProvider) {
    $routeProvider
        .when('/a/order/:id', {
            templateUrl: 'assets/views/admin/order/index.html',
            controller: 'AdminOrderController',
            resolve: {auth: 'AuthRequireResolver'}
        })
        .when('/a/orders', {
            templateUrl: 'assets/views/admin/order/index.html',
            controller: 'AdminOrderListController',
            resolve: {auth: 'AuthRequireResolver'},
            reloadOnSearch: false
        });
});
