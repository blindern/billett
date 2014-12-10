'use strict';

var module = angular.module('billett.event', [
    'ngRoute',
    'ngAnimate',
    'billett.helper.page',
    'hc.marked'
]);

module.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/event/:id', {
        templateUrl: 'views/event/index.html',
        controller: 'EventController'
    });
}]);

module.controller('EventController', function(Page, EventReservation, $http, $scope, $location, $routeParams, $sce, ResponseData, $q) {
    Page.setTitle('Arrangement');

    var loader = Page.setLoading();
    $http.get('api/event/'+encodeURIComponent($routeParams['id'])).success(function(ret) {
        loader();

        // do we have an alias not being used?
        if (ret.alias != null && $routeParams['id'] != ret.alias) {
            $location.path('/event/'+ret.alias);
            return;
        }

        Page.setTitle(ret.title);
        $scope.event = ret;
    }).error(function() {
        $location.path('/');
    });

    // check for reservation
    var reservation;
    $scope.loadingReservation = true;
    $scope.reservation = null;
    EventReservation.restoreReservation().then(function(reservationResult) {
        reservation = reservationResult;
        $scope.reservation = $scope.contact = reservation.data;
    }).finally(function() {
        $scope.loadingReservation = false;
    });

    $scope.contact = {};
    $scope.newres = {};
    $scope.newres.count = 0;
    $scope.newres.total_amount = 0;

    // add/remove ticketgroup selection
    $scope.changeTicketgroupNum = function(ticketgroup, num) {
        if (!('order_count' in ticketgroup)) ticketgroup.order_count = 0;
        ticketgroup.order_count += num;
        $scope.event.max_each_person -= num;
        $scope.newres.total_amount += num * (ticketgroup.price + ticketgroup.fee);
        $scope.newres.count += num;
    };

    // retrieve or create order
    var step1 = function() {
        return $q(function(resolve, reject) {
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
    var step2 = function() {
        var data = {
            'name': $scope.contact.name,
            'email': $scope.contact.email,
            'phone': $scope.contact.phone
        };
        return reservation.update(data);
    };

    $scope.placeOrder = function(force) {
        if (!$scope.accept_terms) {
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
                        angular.forEach(ret, function(val, name) {
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
                    alert("Ukjent feil oppsto ved lagring av ordre: "+err);
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
            alert("Ukjent feil oppsto ved henting av reservasjon: "+err);
        });
    };

    // abort order
    $scope.abortOrder = function() {
        reservation.abort().then(function() {
            reservation = null;
            $scope.reservation = null;
        }, function(err) {
            alert("Klarte ikke å avbryte reservasjonen. Ukjent feil: "+err);
        });
    };
});

module.factory('EventReservation', function($http, $q) {
    var current; // the active reservation (should really only be one)

    function EventReservation(data) {
        this.data = data;
    }

    EventReservation.prototype.persist = function() {
        if (typeof(Storage) !== 'undefined') {
            sessionStorage.pendingReservation = JSON.stringify(this.data);
        }
    };

    EventReservation.prototype.abort = function() {
        var id = this.data.id;
        return $q(function(resolve, reject) {
            $http.delete('api/order/'+id).success(function() {
                EventReservation.removePersistedReservation(id);
                resolve();
            }).error(reject);
        });
    };

    EventReservation.prototype.update = function(data) {
        var self = this;
        return $q(function(resolve, reject) {
            $http.patch('api/order/' + self.data.id, data).success(function (ret) {
                self.data = ret;
                resolve(ret);
            }).error(reject);
        });
    };

    // send to payment
    EventReservation.prototype.place = function(force) {
        var self = this;
        return $q(function(resolve, reject) {
            $http.post('api/order/' + self.data.id + '/'+(force ? 'force' : 'place'))
                .success(resolve)
                .error(reject);
        });
    };

    EventReservation.setReservation = function(data) {
        current = new EventReservation(data);
        current.persist();
        return current;
    };

    EventReservation.getReservation = function(id) {
        return $q(function(resolve, reject) {
            $http.get('api/order/' + id).success(function (ret) {
                if (ret.is_valid) { // real order, no reservation
                    reject("last reservation is valid order");
                    return;
                }
                resolve(new EventReservation(ret));
            }).error(reject);
        });
    };

    EventReservation.removePersistedReservation = function(only_id) {
        if (only_id && current && current.data.id != only_id) return;

        current = null;
        if (typeof(Storage) !== 'undefined') {
            sessionStorage.removeItem('pendingReservation');
        }
    };

    EventReservation.restoreReservation = function() {
        return $q(function(resolve, reject) {
            if (typeof(Storage) === 'undefined' || !sessionStorage.pendingReservation) {
                reject("not found");
                return;
            }

            var data = JSON.parse(sessionStorage.pendingReservation);

            EventReservation.getReservation(data.id).then(function(res) {
                current = res;
                resolve(res);
            }, function(err) {
                EventReservation.removePersistedReservation();
                reject(err);
            });
        });
    };

    EventReservation.create = function(event_id, ticketgroups) {
        return $q(function (resolve, reject) {
            $http.post('api/event/' + event_id + '/createreservation', {
                'ticketgroups': ticketgroups
            }).success(function (res) {
                resolve(EventReservation.setReservation(res));
            }).error(reject);
        });
    };

    return EventReservation;
});

module.filter('range', function() {
    return function(count) {
        count = parseInt(count);
        var ret = [];
        for (var i = 0; i < count; i++) ret.push(i);
        return ret;
    }
});

