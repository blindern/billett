(function() {
    'use strict';

    var module = angular.module('billett.admin');

    module.controller('AdminOrderController', function ($http, $modal, $q, $state, $stateParams, Page, AdminOrder) {
        var ctrl = this;
        Page.setTitle("Ordre");

        var loadOrder = function () {
            return AdminOrder.get({id: $stateParams['id']}, function(ret) {
                ctrl.order = ret;

                // calc order total and generate list of valid tickets
                ctrl.validtickets = [];
                ctrl.total = 0;
                ctrl.total_reserved = 0;
                ctrl.ticketcount = {
                    'reserved': 0,
                    'revoked': 0,
                    'valid': 0
                };
                ctrl.order.tickets.forEach(function (ticket) {
                    if (!ticket.is_valid) {
                        ctrl.total_reserved += ticket.ticketgroup.price + ticket.ticketgroup.fee;
                        ctrl.ticketcount.reserved++;
                    } else if (!ticket.is_revoked) {
                        ctrl.total += ticket.ticketgroup.price + ticket.ticketgroup.fee;
                        ctrl.validtickets.push(ticket.id);
                        ctrl.ticketcount.valid++;
                    } else {
                        ctrl.ticketcount.revoked++;
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

        // delete reservation (of order)
        ctrl.deleteReservation = function () {
            var eventgroup_id = ctrl.order.eventgroup.id;
            ctrl.order.$delete(function () {
                $state.go('admin-orders', {eventgroup_id: eventgroup_id});
            }, function () {
                alert("Feil ved sletting av ordre");
            });
        };

        ctrl.completeOrder = function () {
            var modal = $modal.open({
                templateUrl: 'assets/views/admin/paymentgroup/paymentgroup_select.html',
                controller: 'AdminPaymentgroupSelectController as ctrl',
                resolve: {
                    order: function () {
                        return ctrl.order;
                    },
                    actionText: function () {
                        return 'Marker som betalt';
                    },
                    amount: function () {
                        return ctrl.total_reserved;
                    }
                }
            });

            modal.result.then(function (paymentgroup) {
                $http.post('api/order/'+ctrl.order.id+'/validate', {
                    paymentgroup: paymentgroup.id,
                    amount: ctrl.total_reserved,
                    sendmail: false
                }).success(function () {
                    loadOrder();
                }).error(function (err) {
                    if (err == 'amount mismatched') {
                        alert("Noe i ordren ser ut til å ha endret seg. Prøv på nytt.");
                        loadOrder();
                    } else {
                        alert(err);
                    }
                });
            });
        };

        ctrl.convertOrder = function () {
            $http.post('api/order/'+ctrl.order.id+'/validate').success(function () {
                loadOrder();
            }).error(function (err) {
                alert(err);
            });
        };

        // start new tickets form
        ctrl.addTickets = function () {
            var modal = $modal.open({
                templateUrl: 'assets/views/admin/ticketgroup/add_ticketgroup_to_order.html',
                controller: 'AdminTicketgroupAddToOrderController as ctrl',
                resolve: {
                    eventgroup_id: function () {
                        return ctrl.order.eventgroup.id;
                    },
                    addHandler: function () {
                        return function (ticketgroups) {
                            return $q(function (resolve, reject) {
                                var groups = {};
                                angular.forEach(ticketgroups, function (group) {
                                    groups[group.ticketgroup.id] = group.num
                                });
                                $http.post('api/order/'+ctrl.order.id+'/create_tickets', {
                                    ticketgroups: groups
                                }).success(function () {
                                    // reload order with new data
                                    loadOrder().then(function () {
                                        resolve();
                                    }, function () {
                                        alert("Ukjent feil oppsto ved forsøk på å laste ordren på nytt");
                                        resolve(); // consider it a success anyways
                                    });
                                }).error(function (err) {
                                    reject(err);
                                });
                            });
                        }
                    }
                }
            });
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
            var modal = $modal.open({
                templateUrl: 'assets/views/admin/paymentgroup/paymentgroup_select.html',
                controller: 'AdminPaymentgroupSelectController as ctrl',
                resolve: {
                    order: function () {
                        return ctrl.order;
                    },
                    actionText: function () {
                        return 'Marker som betalt';
                    },
                    amount: function () {
                        return ticket.ticketgroup.price + ticket.ticketgroup.fee;
                    }
                }
            });

            modal.result.then(function (paymentgroup) {
                $http.post('api/ticket/'+ticket.id+'/validate', {
                    paymentgroup_id: paymentgroup.id
                }).success(function () {
                    loadOrder();
                }).error(function (err) {
                    alert(err);
                });
            });
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
            var modal = $modal.open({
                templateUrl: 'assets/views/admin/payment/payment_add.html',
                controller: 'AdminPaymentAddController as ctrl',
                resolve: {
                    order: function () {
                        return ctrl.order;
                    }
                }
            });

            modal.result.then(function (payment) {
                loadOrder();
            });
        };

        // send email
        ctrl.email = function () {
            var modal = $modal.open({
                templateUrl: 'assets/views/admin/order/email_modal.html',
                controller: 'AdminOrderEmailController as ctrl',
                resolve: {
                    order: function () {
                        return ctrl.order;
                    }
                }
            });

            modal.result.then(function () {
                Page.toast("E-post ble sendt", {class: 'success'});
            });
        };
    });
})();
