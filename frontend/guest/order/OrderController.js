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

    module.controller('OrderController', function (Page, $location, $scope, ResponseData, Analytics) {
        Page.setTitle('Betaling');

        var res = ResponseData.get('order_receipt');
        if (!res) {
            $location.path('/');
            return;
        }

        $scope.order = res.order;
        $scope.payment = res.payment;

        // TODO: don't add multiple times if user is reloading page

        Analytics.addTrans(res.order.order_text_id, 'Billett UKA på Blindern', res.payment.amount, 0, 0, '', '', '', 'NOK');

        // group the entries by ticketgroup
        var ticketGroups = {};
        angular.forEach(res.order.tickets, function(ticket) {
            if (ticket.ticketgroup.id in ticketGroups) {
                ticketGroups[ticket.ticketgroup.id][5]++;
            } else {
                ticketGroups[ticket.ticketgroup.id] = [
                    res.order.order_text_id,
                    ticket.event.id + '-' + ticket.ticketgroup.id,
                    ticket.event.title + '(' + ticket.ticketgroup.title + ')',
                    ticket.event.category,
                    ticket.ticketgroup.price + ticket.ticketgroup.fee,
                    1
                ];
            }
        });
        angular.forEach(ticketGroups, function(group) {
            Analytics.addItem.apply(Analytics, group);
        });

        Analytics.trackTrans();
    });
})();
