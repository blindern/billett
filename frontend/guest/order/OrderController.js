import {api} from '../../api';

import receiptTemplate from './receipt.html?raw';

(function() {
    'use strict';

    var module = angular.module('billett.guest');

    module.config(function ($stateProvider) {
        $stateProvider.state('order-complete', {
            url: '/order/complete',
            template: receiptTemplate,
            controller: 'OrderController'
        });
    });

    module.controller('OrderController', function (Page, $http, $location, $scope, Analytics) {
        $http.get(api('order/receipt')).then(function (res) {
            $scope.order = res.data.order;
            $scope.payment = res.data.payment;

            // TODO: don't add multiple times if user is reloading page

            var is_test = res.data.order.order_text_id.slice(-5) == "-TEST";
            Analytics.addTrans(res.data.order.order_text_id, 'Billett UKA på Blindern' + (is_test ? ' (TEST)' : ''), res.data.payment.amount, 0, 0, '', '', '', 'NOK');

            // group the entries by ticketgroup
            var ticketGroups = {};
            angular.forEach(res.data.order.tickets, function(ticket) {
                if (ticket.ticketgroup.id in ticketGroups) {
                    ticketGroups[ticket.ticketgroup.id][5]++;
                } else {
                    ticketGroups[ticket.ticketgroup.id] = [
                        res.data.order.order_text_id,
                        ticket.event.id + '-' + ticket.ticketgroup.id,
                        ticket.event.title + ' (' + ticket.ticketgroup.title + ')',
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


        }, function (err) {
            //$location.path('/');
            console.log('err', err);
        });
    });
})();
