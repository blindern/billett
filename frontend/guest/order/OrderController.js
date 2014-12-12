(function() {
    'use strict';

    var module = angular.module('billett.order', [
        'ngRoute',
        'billett.common.PageService',
        'billett.common.ResponseDataService'
    ]);

    module.config(function ($routeProvider) {
        $routeProvider.when('/dibs/accept', {
            templateUrl: 'assets/views/guest/order/receipt.html',
            controller: 'OrderController'
        });
    });

    module.controller('OrderController', function (Page, $location, $scope, ResponseData) {
        Page.setTitle('Betaling');

        var res = ResponseData.get('order_receipt');
        if (!res) {
            $location.path('/');
            return;
        }

        $scope.order = res.order;
        $scope.payment = res.payment;
    });
})();
