angular.module('billett.admin').config(function ($stateProvider) {
    $stateProvider
        .state('admin-order-new', {
            url: '/a/order/new/:id',
            templateProvider: ($q) => {
                return $q((resolve) => {
                    // lazy load the view
                    require.ensure([], () => resolve(require('!!html!./new.html')));
                });
            },
            controller: 'AdminOrderNewController as ctrl',
            resolve: {auth: 'AuthRequireResolver'},
            params: {
                'paymentgroup_id': null
            }
        })
        .state('admin-order', {
            url: '/a/order/:id',
            templateProvider: ($q) => {
                return $q((resolve) => {
                    // lazy load the view
                    require.ensure([], () => resolve(require('!!html!./order.html')));
                });
            },
            controller: 'AdminOrderController as ctrl',
            resolve: {auth: 'AuthRequireResolver'}
        })
        .state('admin-orders', {
            url: '/a/orders?eventgroup_id',
            templateProvider: ($q) => {
                return $q((resolve) => {
                    // lazy load the view
                    require.ensure([], () => resolve(require('!!html!./index.html')));
                });
            },
            controller: 'AdminOrderListController',
            resolve: {auth: 'AuthRequireResolver'},
            reloadOnSearch: false
        });
});
