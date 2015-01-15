angular.module('billett.admin').controller('AdminOrderNewController', function ($http, $location, $modal, $q, $scope, $state, $stateParams, $timeout, focus, Page, AdminEventgroup, AdminPaymentgroup, AdminOrder) {
    var ctrl = this;
    Page.setTitle('Ny ordre');

    var loader = Page.setLoading();
    $q.all([
        AdminEventgroup.get({id: $stateParams['id']}).$promise,
        AdminPaymentgroup.getValid(parseInt($stateParams['id'])).$promise
    ]).then(function (res) {
        ctrl.eventgroup = res[0];
        ctrl.paymentgroups = res[1];

        // if page is reloaded, check if we are in progress of a order
        if (localStorage['billett.neworder.id']) {
            AdminOrder.get({id: localStorage['billett.neworder.id']}, function (order) {
                ctrl.order = order;
                buildTicketgroupList();
                loader();
            }, function () {
                delete localStorage['billett.neworder.id'];
                loader();
                ctrl.addTickets();
            });
        } else {
            loader();
            ctrl.addTickets();
        }

        loadLastPaymentgroup();
    }, function () {
        $location.path('a');
    });


    // -------------------------------------------------------------------------
    // payment group

    var loadLastPaymentgroup = function () {
        ctrl.active_paymentgroup = AdminPaymentgroup.getPreferredGroup(ctrl.paymentgroups, $stateParams['paymentgroup_id']);
        if (ctrl.active_paymentgroup) {
            ctrl.changePaymentgroup();
        }
    };

    ctrl.changePaymentgroup = function () {
        AdminPaymentgroup.setPreferredGroup(ctrl.active_paymentgroup);
    };


    // -------------------------------------------------------------------------
    // actual order handling

    // reset order details
    var resetOrder = function () {
        ctrl.order = {};
        ctrl.total = 0;
        ctrl.ticketgroups = null;
    };

    // create a blank order
    ctrl.createBlank = function () {
        getOrder();
    };

    // convert to actual order and mark as paid
    ctrl.completeOrder = function () {
        var loader = Page.setLoading();
        ctrl.saveEdit().then(function () {
            $http.post('api/order/' + ctrl.order.id + '/validate', {
                paymentgroup: ctrl.active_paymentgroup.id,
                amount: ctrl.total,
                sendmail: true
            }).success(function () {
                loader();
                Page.toast('Ordren ble vellykket opprettet. <a href="a/order/' + ctrl.order.id + '">Vis ordre</a>', {
                    class: 'success',
                    timeout: 15000
                });

                delete localStorage['billett.neworder.id'];
                resetOrder();
            }).error(function (err) {
                loader();
                if (err == 'amount mismatched') {
                    alert("Noe i reservasjonen ser ut til å ha endret seg. Prøv på nytt.");
                    getOrder(true);
                } else {
                    alert(err);
                }
            });
        }, function (err) {
            alert("Ukjent feil ved lagring av endringer: "+err);
        });
    };

    // save edits to order
    ctrl.saveEdit = function () {
        return ctrl.order.$update();
    };

    // save as permanent reservation
    ctrl.saveOrder = function () {
        ctrl.order.$update(function () {
            delete localStorage['billett.neworder.id'];
            $state.go('admin-order', {id: ctrl.order.id});
        });
    };

    // abort new order (delete reservation and initialize new order)
    ctrl.abortOrder = function () {
        ctrl.order.$delete(function () {
            delete localStorage['billett.neworder.id'];
            resetOrder();
        }, function () {
            alert("Feil ved sletting av ordre");
        });
    };

    // get the order by using promise (create if not exists)
    var getOrder = function (reload) {
        return $q(function (resolve, reject) {
            // if id is set, the order exists already
            if (ctrl.order.id) {
                if (reload) {
                    AdminOrder.get({id: ctrl.order.id}, function (order) {
                        ctrl.order = order;

                        buildTicketgroupList();
                        resolve(ctrl.order);
                    }, function (err) {
                        reject(err);
                    });
                } else {
                    resolve(ctrl.order);
                }

                return;
            }

            // create new order
            var order = new AdminOrder({
                eventgroup_id: ctrl.eventgroup.id,
                name: ctrl.order.name,
                email: ctrl.order.email,
                phone: ctrl.order.phone,
                recruiter: ctrl.order.recruiter,
                comment: ctrl.order.comment
            });

            order.$save(function (res) {
                ctrl.order = res;

                localStorage['billett.neworder.id'] = ctrl.order.id;

                buildTicketgroupList();
                resolve(ctrl.order);
            }, function (res) {
                alert("Ukjent feil oppsto ved opprettelse av ordre");
                reject(res);
            });
        });
    };

    // -------------------------------------------------------------------------
    // tickets reserved

    // rebuild ticketgroup list (call when order changes)
    // also update order total
    var buildTicketgroupList = function () {
        ctrl.ticketgroups = null;
        ctrl.total = 0;
        if (!ctrl.order.tickets || ctrl.order.tickets.length == 0) return;

        if (ctrl.order.is_valid) {
            delete localStorage['billett.neworder.id'];
            $state.go('admin-order', {id: ctrl.order.id});
        }

        ctrl.ticketgroups = [];
        var ticketgroups = {};
        ctrl.order.tickets.forEach(function (ticket) {
            if (!(ticket.ticketgroup.id in ticketgroups)) {
                ctrl.ticketgroups.push(ticketgroups[ticket.ticketgroup.id] = {
                    ticketgroup: ticket.ticketgroup,
                    event: ticket.event,
                    tickets: [],
                    num: 0
                });
            }

            var g = ticketgroups[ticket.ticketgroup.id];
            g.num++;
            g.tickets.push(ticket);

            ctrl.total += ticket.ticketgroup.price + ticket.ticketgroup.fee;
        });

        ctrl.ticketgroups.sort(function (left, right) {
            return left.event.time_start - right.event.time_start;
        });
    };

    // delete a reserved ticket
    ctrl.deleteTicket = function (ticketgroup) {
        ticketgroup.working = true;
        $http.delete('api/ticket/' + ticketgroup.tickets[0].id).success(function () {
            getOrder(true).then(function () {
                ticketgroup.working = false;
            }, function () {
                alert("Error reloading order");
            });
        }).error(function () {
            alert("Unknown error deleting order");
        });
    };


    // -------------------------------------------------------------------------
    // adding tickets to reservation

    ctrl.addTickets = function () {
        var modal = $modal.open({
            templateUrl: 'assets/views/admin/ticketgroup/add_ticketgroup_to_order.html',
            controller: 'AdminTicketgroupAddToOrderController as ctrl',
            resolve: {
                eventgroup_id: function () {
                    return ctrl.eventgroup.id;
                },
                addHandler: function () {
                    return function (ticketgroups) {
                        return $q(function (resolve, reject) {
                            getOrder().then(function (order) {
                                var groups = {};
                                angular.forEach(ticketgroups, function (group) {
                                    groups[group.ticketgroup.id] = group.num
                                });
                                $http.post('api/order/'+order.id+'/create_tickets', {
                                    ticketgroups: groups
                                }).success(function (res) {
                                    // reload order with new data
                                    getOrder(true).then(function () {
                                        resolve();
                                    }, function () {
                                        alert("Ukjent feil oppsto ved forsøk på å laste ordren på nytt");
                                        resolve(); // consider it a success anyways
                                    });
                                }).error(function (res) {
                                    reject(res);
                                });
                            });
                        });
                    }
                }
            }
        });

        modal.result.then(function () {
            focus('namefocus');
        });
    };

    resetOrder();
});
