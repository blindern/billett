import {api} from '../../api';

(function() {
    'use strict';

    var module = angular.module('billett.guest');

    module.factory('EventReservation', function ($http, $q) {
        var current; // the active reservation (should really only be one)

        function EventReservation(data) {
            this.data = data;
        }

        EventReservation.prototype.persist = function () {
            if (typeof(Storage) !== 'undefined') {
                sessionStorage.pendingReservation = JSON.stringify(this.data);
            }
        };

        EventReservation.prototype.abort = function () {
            var id = this.data.id;
            return $q(function (resolve, reject) {
                $http.delete(api('order/' + id)).success(function () {
                    EventReservation.removePersistedReservation(id);
                    resolve();
                }).error(reject);
            });
        };

        EventReservation.prototype.update = function (data) {
            var self = this;
            return $q(function (resolve, reject) {
                $http.patch(api('order/' + self.data.id), data).success(function (ret) {
                    self.data = ret;
                    resolve(ret);
                }).error(reject);
            });
        };

        // send to payment
        EventReservation.prototype.place = function (force) {
            var self = this;
            return $q(function (resolve, reject) {
                $http.post(api('order/' + self.data.id + '/' + (force ? 'force' : 'place')))
                    .success(resolve)
                    .error(reject);
            });
        };

        EventReservation.setReservation = function (data) {
            current = new EventReservation(data);
            current.persist();
            return current;
        };

        EventReservation.getReservation = function (id) {
            return $q(function (resolve, reject) {
                $http.get(api('order/' + id)).success(function (ret) {
                    if (ret.is_valid) { // real order, no reservation
                        reject("last reservation is valid order");
                        return;
                    }
                    resolve(new EventReservation(ret));
                }).error(reject);
            });
        };

        EventReservation.removePersistedReservation = function (only_id) {
            if (only_id && current && current.data.id != only_id) return;

            current = null;
            if (typeof(Storage) !== 'undefined') {
                sessionStorage.removeItem('pendingReservation');
            }
        };

        EventReservation.restoreReservation = function () {
            return $q(function (resolve, reject) {
                if (typeof(Storage) === 'undefined' || !sessionStorage.pendingReservation) {
                    reject("not found");
                    return;
                }

                var data = JSON.parse(sessionStorage.pendingReservation);

                EventReservation.getReservation(data.id).then(function (res) {
                    current = res;
                    resolve(res);
                }, function (err) {
                    EventReservation.removePersistedReservation();
                    reject(err);
                });
            });
        };

        EventReservation.create = function (event_id, ticketgroups) {
            return $q(function (resolve, reject) {
                $http.post(api('event/' + event_id + '/createreservation'), {
                    'ticketgroups': ticketgroups
                }).success(function (res) {
                    resolve(EventReservation.setReservation(res));
                }).error(reject);
            });
        };

        return EventReservation;
    });
})();
