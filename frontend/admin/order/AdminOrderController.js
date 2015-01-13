(function() {
    'use strict';

    var module = angular.module('billett.admin');

    module.controller('AdminOrderController', function ($http, $modal, $stateParams, Page, AdminOrder) {
        var ctrl = this;
        Page.setTitle("Ordre");

        var loadOrder = function () {
            return AdminOrder.get({id: $stateParams['id']}, function(ret) {
                ctrl.order = ret;

                // calc order total and generate list of valid tickets
                ctrl.validtickets = [];
                ctrl.total = 0;
                ctrl.order.tickets.forEach(function (ticket) {
                    if (ticket.is_valid && !ticket.is_revoked) {
                        ctrl.total += ticket.ticketgroup.price + ticket.ticketgroup.fee;
                        ctrl.validtickets.push(ticket.id);
                    }
                });

                // total paid amount
                ctrl.total_paid = 0;
                ctrl.order.payments.forEach(function (payment) {
                    ctrl.total_paid += 1*payment.amount;
                });
            }).$promise;
        };

        var loader = Page.setLoading();
        loadOrder().then(function () {
            loader();
        }, function() {
            loader();
            Page.set404();
        });

        var editFields = ['name', 'email', 'phone', 'recruiter', 'comment'];

        // start edit mode (order details)
        ctrl.startEdit = function () {
            ctrl.edit = editFields.reduce(function (prev, cur) {
                prev[cur] = ctrl.order[cur];
                return prev;
            }, {});
        };

        // abort edit mode (order details)
        ctrl.abortEdit = function () {
            delete ctrl.edit;
        };

        // save order details when editing
        ctrl.save = function () {
            editFields.forEach(function (field) {
                ctrl.order[field] = ctrl.edit[field];
            });
            ctrl.order.$update(function (ret) {
                ctrl.order = ret;
                delete ctrl.edit;
            });
        };

        // start new tickets form
        ctrl.newTicket = function () {
            // TODO
            alert("TODO");
        };

        // revoke specific ticket
        ctrl.revokeTicket = function (ticket) {
            var modal = $modal.open({
                templateUrl: 'assets/views/admin/ticket/ticket_revoke_modal.html',
                controller: 'AdminTicketRevokeController as ctrl',
                resolve: {
                    order: function () {
                        return ctrl.order;
                    },
                    ticket: function () {
                        return ticket;
                    }
                }
            });

            modal.result.then(function () {
                loadOrder();
            });
        };

        // validate specific ticket
        ctrl.validateTicket = function (ticket) {
            // TODO
            alert("TODO");
        };

        // delete ticket reservation
        ctrl.deleteTicket = function (ticket) {
            $http.delete('api/ticket/' + ticket.id).success(function () {
                console.log("ticket deleted");
            }).finally(function () {
                loadOrder();
            });
        };

        // start new payment form
        ctrl.newPayment = function () {
            // TODO
            alert("TODO");
        };

        // send email
        ctrl.email = function () {
            $modal.open({
                templateUrl: 'assets/views/admin/order/email_modal.html',
                controller: 'AdminOrderEmailController as ctrl',
                resolve: {
                    order: function () {
                        return ctrl.order;
                    }
                }
            });
        };
    });
})();
