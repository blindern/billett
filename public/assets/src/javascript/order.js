'use strict';

var mod = angular.module('billett.order', ['ngRoute', 'billett', 'billett.helper.page'])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/dibs/accept', {
        templateUrl: 'views/order/receipt.html',
        controller: 'OrderController'
    });
}])

.controller('OrderController', function(Page, $location, $scope, ResponseData) {
    Page.setTitle('Betaling');

    var res = ResponseData.get('order_receipt');
    if (!res) {
        $location.path('/');
        return;
    }

    $scope.order = res.order;
    $scope.payment = res.payment;
});
