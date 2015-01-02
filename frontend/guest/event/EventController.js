(function() {
    'use strict';

    var module = angular.module('billett.guest');

    module.config(function ($routeProvider) {
        $routeProvider.when('/event/:id', {
            templateUrl: 'assets/views/guest/event/index.html',
            controller: 'EventController as ctrl'
        });
    });

    module.controller('EventController', function (Page, EventReservation, $http, $scope, $location, $routeParams, $sce, ResponseData, $q) {
        var ctrl = this;
        Page.setTitle('Arrangement');

        var loader = Page.setLoading();
        $http.get('api/event/' + encodeURIComponent($routeParams['id'])).success(function (ret) {
            loader();

            // do we have an alias not being used?
            if (ret.alias != null && $routeParams['id'] != ret.alias) {
                $location.path('/event/' + ret.alias);
                return;
            }

            $scope.event = ret;
            ctrl.event_status = ret.web_selling_status;
            if (ret.selling_text && (ret.web_selling_status == 'unknown' || ret.web_selling_status == 'no_web_tickets')) {
                ctrl.event_status = 'selling_text';
            }
        }).error(function () {
            loader();
            Page.set404();
        });

        // check for reservation
        var reservation;
        $scope.loadingReservation = true;
        $scope.reservation = null;
        EventReservation.restoreReservation().then(function (reservationResult) {
            reservation = reservationResult;
            $scope.reservation = $scope.contact = reservation.data;
        }).finally(function () {
            $scope.loadingReservation = false;
        });

        $scope.contact = {};
        $scope.newres = {};
        $scope.newres.count = 0;
        $scope.newres.total_amount = 0;

        // add/remove ticketgroup selection
        $scope.changeTicketgroupNum = function (ticketgroup, num) {
            if (!('order_count' in ticketgroup)) ticketgroup.order_count = 0;
            ticketgroup.order_count += num;
            $scope.event.max_each_person -= num;
            $scope.newres.total_amount += num * (ticketgroup.price + ticketgroup.fee);
            $scope.newres.count += num;
        };

        // retrieve or create order
        var step1 = function () {
            return $q(function (resolve, reject) {
                if (reservation) {
                    resolve(reservation);
                } else {
                    // must create a reservation
                    if ($scope.newres.count == 0) {
                        Page.toast("Du må velge noen billetter.", {class: 'warning'});
                        return;
                    }

                    var groups = {};
                    angular.forEach($scope.event.ticketgroups, function (g) {
                        var c = parseInt(g.order_count);
                        if (c <= 0) return;
                        groups[g.id] = c;
                    });

                    EventReservation.create($scope.event.id, groups).then(function (res) {
                        reservation = res;
                        $scope.reservation = res.data;
                        resolve(res);
                    }, reject);
                }
            });
        };

        // update order with contact info
        var step2 = function () {
            var data = {
                name: $scope.contact.name,
                email: $scope.contact.email,
                phone: $scope.contact.phone,
                recruiter: $scope.contact.recruiter
            };
            return reservation.update(data);
        };

        $scope.placeOrder = function (force) {
            if (!$scope.contact.accept_terms) {
                alert("Du må godta betingelsene for å fullføre.");
                return;
            }

            // make sure reservation exists, or create it
            step1().then(function () {
                console.log("pre step2");
                // update reservation contact data
                step2().then(function () {
                    // send to payment
                    reservation.place(force).then(function (ret) {
                        if (force) {
                            angular.forEach(ret, function (val, name) {
                                ResponseData.set(name, val);
                            });
                            $location.path('/dibs/accept');
                        } else {
                            $scope.checkout = ret;
                            $scope.checkout_url = $sce.trustAsResourceUrl(ret.url);

                            // FIXME: should not perform DOM call from here
                            setTimeout(function () {
                                $('#checkoutForm').submit();
                            }, 0);
                        }
                    }, function (err) {
                        // sending to payment failed
                        // TODO: handle error cases
                        alert("Ukjent feil oppsto ved lagring av ordre: " + err);
                    });
                }, function (err) {
                    // updating order failed
                    if (err == "data validation failed") {
                        Page.toast("Ugyldig inndata i skjemaet.", {class: 'warning'});
                    } else {
                        alert("Ukjent feil oppsto ved lagring av kontaktdata: " + err);
                    }
                });
            }, function (err) {
                // creating reservation failed
                // TODO: handle error cases
                alert("Ukjent feil oppsto ved henting av reservasjon: " + err);
            });
        };

        // abort order
        $scope.abortOrder = function () {
            reservation.abort().then(function () {
                reservation = null;
                $scope.reservation = null;
            }, function (err) {
                alert("Klarte ikke å avbryte reservasjonen. Ukjent feil: " + err);
            });
        };
    });
})();
