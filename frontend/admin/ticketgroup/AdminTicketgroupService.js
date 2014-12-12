(function() {
    'use strict';

    var module = angular.module('billett.admin.ticketgroup');

    module.factory('AdminTicketgroup', function ($resource) {
        var r = $resource('api/ticketgroup/:id', {
            'id': '@id',
            'admin': 1
        }, {
            update: {method: 'PUT'}
        });

        return r;
    });
})();
