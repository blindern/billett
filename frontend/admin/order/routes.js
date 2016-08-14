angular.module('billett.admin').config(function ($stateProvider) {
    $stateProvider
        .state('admin-order-new', {
            url: '/a/order/new/:id',
            templateUrl: require('./new.html'),
            controller: 'AdminOrderNewController as ctrl',
            resolve: {auth: 'AuthRequireResolver'},
            params: {
                'paymentgroup_id': null
            }
        })
        .state('admin-order', {
            url: '/a/order/:id',
            templateUrl: require('./order.html'),
            controller: 'AdminOrderController as ctrl',
            resolve: {auth: 'AuthRequireResolver'}
        })
        .state('admin-orders', {
            url: '/a/orders?eventgroup_id',
            templateUrl: require('./index.html'),
            controller: 'AdminOrderListController',
            resolve: {auth: 'AuthRequireResolver'},
            reloadOnSearch: false
        });
});
