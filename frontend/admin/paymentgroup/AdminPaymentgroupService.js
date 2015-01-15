angular.module('billett.admin').factory('AdminPaymentgroup', function ($http, $resource) {
    var r = $resource('api/paymentgroup/:id', {
        id: '@id'
    }, {
        update: {
            method: 'PUT'
        }
    });

    r.prototype.close = function () {
        return $http.post('api/paymentgroup/' + this.id + '/close');
    };

    r.getValid = function (eventgroup_id) {
        return this.query({filter: 'eventgroup_id='+parseInt(eventgroup_id)+',time_end=0'});
    };

    r.setPreferredGroup = function (group) {
        if (typeof(Storage) !== 'undefined') {
            sessionStorage.lastPaymentgroup = group.id;
        }
    };

    r.getPreferredGroup = function (grouplist, override_id) {
        var group = null;
        var last_id = (typeof(Storage) !== 'undefined' && sessionStorage.lastPaymentgroup ? sessionStorage.lastPaymentgroup : null);

        grouplist.forEach(function (row) {
            if (row.id == override_id) {
                group = row;
            } else if (row.id == last_id && !group) {
                group = row;
            }
        });

        return group;
    };

    return r;
});
