(function() {
    'use strict';

    var module = angular.module('billett.admin.eventgroup');

    module.factory('AdminEventgroup', function ($resource) {
        var r = $resource('api/eventgroup/:id', {
            'id': '@id',
            'admin': 1
        }, {
            update: {method: 'PUT'}
        });

        return r;
    });
})();
