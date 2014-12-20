(function() {
    'use strict';

    var module = angular.module('billett.admin');

    module.factory('AdminOrder', function ($resource) {
        var r = $resource('api/order/:id', {
            'id': '@id',
            'admin': 1,
            limit: 20
        }, {
            query: {
                isArray: false
            },
            update: {method: 'PUT'}
        });

        return r;
    });
})();
