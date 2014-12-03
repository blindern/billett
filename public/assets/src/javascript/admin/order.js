'use strict';

angular.module('billett.admin.order', [
    'ngRoute',
    'billett.auth',
    'billett.helper.page'
])

.config(function($routeProvider) {
    $routeProvider.when('/a/order/:id', {
        templateUrl: 'views/admin/order/index.html',
        controller: 'AdminOrderController',
        resolve: {auth: 'AuthRequireResolver'}
    });
})

.controller('AdminOrderController', function(Page, $routeParams) {
    // TODO
});
