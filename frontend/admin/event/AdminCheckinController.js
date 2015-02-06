(function() {
    'use strict';

    var module = angular.module('billett.admin');

    module.controller('AdminCheckinController', function (AdminEvent, AdminOrder, Page, $http, $stateParams, $scope) {
        var ctrl = this;

        Page.setTitle("Innsjekking av billetter");

        var loader = Page.setLoading();
        AdminEvent.get({id:$stateParams['id'], checkin: true}, function(ret) {
            loader();
            ctrl.event = ret;
        }, function() {
            loader();
            Page.set404();
        });


        ctrl.checkin = function (ticket_id) {
            return $http.post('api/ticket/' + ticket_id + '/checkin').then(function () {
                runSearch();
            });
        };

        ctrl.checkout = function (ticket_id) {
            return $http.post('api/ticket/' + ticket_id + '/checkout').then(function () {
                runSearch();
            });
        };


        // searching
        ctrl.orders = null;
        ctrl.keysearch = null;
        ctrl.searchinput = {
            page: 1
        };
        ctrl.performSearch = function () {
            console.log("do search");
            $('#keyfield').select();
        };

        $scope.$watchCollection('ctrl.searchinput', function (oldVal, newVal) {
            /*if (oldVal.page == newVal.page && newVal.page != 1) {
                ctrl.searchinput.page = 1;
                return;
            }*/

            runSearch();
        });

        function runSearch() {
            var filter = generateSearchFilter();
            if (filter == '') {
                ctrl.orders = null;
                return;
            }

            var limit = 6;
            var q = {
                order: '-time',
                with: 'tickets.event,tickets.ticketgroup,payments',
                limit: limit,
                offset: limit * (ctrl.searchinput.page  - 1),
                filter: filter
            };

            ctrl.orders = AdminOrder.query(q, function () {
                ctrl.orders.result.forEach(function (order) {
                    order.total_valid = 0;
                    order.total_reserved = 0;
                    order.tickets.forEach(function (ticket) {
                        if (ticket.is_revoked) return;
                        order[ticket.is_valid ? 'total_valid' : 'total_reserved'] += ticket.ticketgroup.price + ticket.ticketgroup.fee;
                    });
                });
            });
        }

        function generateSearchFilter() {
            ctrl.keysearch = null;
            var r = [];
            if (ctrl.searchinput.name) {
                if (/^\d{6}$/.test(ctrl.searchinput.name)) {
                    ctrl.keysearch = ctrl.searchinput.name;
                    r.push('tickets.key=' + ctrl.searchinput.name);
                } else {
                    r.push('name:like:' + ctrl.searchinput.name + '%');
                }
            }

            if (ctrl.searchinput.id) {
                var x = ctrl.searchinput.id.length > 8 ? 'order_text_id' : 'id';
                r.push(x + '=' + ctrl.searchinput.id);
            }

            ['email', 'phone'].forEach(function (x) {
                if (ctrl.searchinput[x]) {
                    r.push(x + ':like:' + ctrl.searchinput[x] + '%');
                }
            });

            return r.join(',');
        }
    });
})();
