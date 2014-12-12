(function() {
    'use strict';

    var module = angular.module('billett.admin.order', [
        'ngRoute',
        'billett.auth',
        'billett.common.PageService'
    ]);

    module.config(function ($routeProvider) {
        $routeProvider.when('/a/order/:id', {
            templateUrl: 'assets/views/admin/order/index.html',
            controller: 'AdminOrderController',
            resolve: {auth: 'AuthRequireResolver'}
        });
    });

    module.controller('AdminOrderController', function (Page, $routeParams) {
        // TODO
    });
})();
