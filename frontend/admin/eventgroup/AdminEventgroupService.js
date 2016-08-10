(function() {
    'use strict';

    var module = angular.module('billett.admin');

    module.factory('AdminEventgroup', function ($http, $resource) {
        var r = $resource('api/eventgroup/:id', {
            'id': '@id',
            'admin': 1
        }, {
            update: {method: 'PUT'}
        });

        r.getSoldTicketsStats = function (id) {
            return $http.get('api/eventgroup/' + id + '/sold_tickets_stats');
        };

        return r;
    });
})();
