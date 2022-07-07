import {api} from '../../api';

var module = angular.module('billett.admin');

module.factory('AdminTicketgroup', function ($resource) {
    var r = $resource(api('ticketgroup/:id'), {
        'id': '@id',
        'admin': 1
    }, {
        update: {method: 'PUT'}
    });

    return r;
});
