(function() {
    'use strict';

    var module = angular.module('billett.admin');

    module.controller('AdminOrderListController', function (AdminOrder, Page, $scope, $location) {
        $scope.curPage = 1;
        var limit = 20;
        var get = function() {
            var q = {
                order: '-time',
                with: 'tickets.event,tickets.ticketgroup,payments',
                limit: limit,
                offset: limit * ($scope.search.page - 1),
                filter: genFilter()
            };
            $scope.orders = AdminOrder.query(q, function () {
                $scope.orders.result.forEach(function (order) {
                    order.total_valid = 0;
                    order.total_reserved = 0;
                    order.tickets.forEach(function (ticket) {
                        if (ticket.is_revoked) return;
                        order[ticket.is_valid ? 'total_valid' : 'total_reserved'] += ticket.ticketgroup.price + ticket.ticketgroup.fee;
                    });
                });
            });
        };

        var equals = ['eventgroup_id', 'id', 'order_text_id', 'tickets.id', 'tickets.key', 'tickets.event.id', 'payments.transaction_id'];
        var genFilter = function() {
            var r = [];
            angular.forEach($scope.search, function(val, name) {
                $location.search(name, (name == 'page' && val == 1 ? null : val||null));

                if (val == "" || name == 'page') return;
                if (equals.indexOf(name) != -1) {
                    r.push(name + '=' + val);
                } else {
                    r.push(name + ':like:' + val+'%');
                }
            });

            return r.join(',');
        };

        var updateFromLocation = function() {
            console.log("updating data");
            $scope.search = {};
            $scope.search.page = 1;
            angular.forEach($location.search(), function(val, name) {
                $scope.search[name] = val;
            });
        };

        updateFromLocation();
        $scope.$on('$routeUpdate', updateFromLocation);

        $scope.$watchCollection('search', function (oldVal, newVal) {
            if (oldVal.page == newVal.page && newVal.page != 1) {
                $scope.search.page = 1;
                return;
            }

            get();
        });
    });
})();
