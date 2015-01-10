angular.module('billett.admin').factory('AdminPaymentgroupService', function ($http, $resource) {
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

    return r;
});
