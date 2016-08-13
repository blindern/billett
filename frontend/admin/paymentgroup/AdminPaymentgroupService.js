import {api} from '../../api';

angular.module('billett.admin').factory('AdminPaymentgroup', function ($http, $modal, $resource) {
    var r = $resource(api('paymentgroup/:id'), {
        id: '@id'
    }, {
        update: {
            method: 'PUT'
        }
    });

    r.prototype.close = function () {
        return $http.post(api('paymentgroup/' + this.id + '/close'));
    };

    r.getValid = function (eventgroup_id) {
        return this.query({filter: 'eventgroup_id='+parseInt(eventgroup_id)+',time_end:NULL'});
    };

    r.setPreferredGroup = function (group) {
        if (group) {
            sessionStorage.lastPaymentgroup = group.id;
        }
    };

    r.getPreferredGroup = function (grouplist, override_id) {
        var group = null;
        var last_id = sessionStorage.lastPaymentgroup ? sessionStorage.lastPaymentgroup : null;

        grouplist.forEach(function (row) {
            if (row.id == override_id) {
                group = row;
            } else if (row.id == last_id && !group) {
                group = row;
            }
        });

        return group;
    };

    r.newModal = function (eventgroupId) {
        return $modal.open({
            templateUrl: require('./new.html'),
            controller: 'AdminPaymentgroupNewController as ctrl',
            resolve: {
                eventgroupId: function () {
                    return eventgroupId;
                }
            }
        });
    };

    r.selectModal = function (resolve) {
        return $modal.open({
            templateUrl: require('./paymentgroup_select.html'),
            controller: 'AdminPaymentgroupSelectController as ctrl',
            resolve: resolve
        });
    };

    return r;
});
