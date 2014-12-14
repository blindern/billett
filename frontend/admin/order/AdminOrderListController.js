(function() {
    'use strict';

    var module = angular.module('billett.admin.order');

    module.config(function ($routeProvider) {
        $routeProvider.when('/a/orders', {
            templateUrl: 'assets/views/admin/order/index.html',
            controller: 'AdminOrderListController',
            resolve: {auth: 'AuthRequireResolver'},
            reloadOnSearch: false
        });
    });

    module.controller('AdminOrderListController', function (AdminOrder, Page, $scope, $location) {
        $scope.orders = AdminOrder.query({
            order: '-time',
            with: 'tickets.event,tickets.ticketgroup'
        });

        var equals = ['id', 'order_text_id', 'tickets.id', 'tickets.key', 'tickets.event.id', 'payments.transaction_id'];

        var genFilter = function() {
            var r = [];
            angular.forEach($scope.search, function(val, name) {
                $location.search(name, val||null);

                if (val == "") return;
                if (equals.indexOf(name) != -1) {
                    r.push(name + '=' + val);
                } else {
                    r.push(name + ':like:' + val+'%');
                }
            });

            return r.join(',');
        };

        $scope.search = {};
        angular.forEach($location.search(), function(val, name) {
            $scope.search[name] = val;
        });
        $scope.$watchCollection('search', function() {
            $scope.orders = AdminOrder.query({
                order: '-time',
                with: 'tickets.event,tickets.ticketgroup,payments',
                filter: genFilter()
            });
        });
    });
})();
