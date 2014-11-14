'use strict';

angular.module('billett.admin.order', [
    'ngRoute',
    'billett.helper.page'
])

.config(function($routeProvider) {
    $routeProvider.when('/a/order/:id', {
        templateUrl: 'views/admin/order/index.html',
        controller: 'AdminOrderController'
    });
})

.controller('AdminOrderController', function(Page, $routeParams) {
    // TODO
});
