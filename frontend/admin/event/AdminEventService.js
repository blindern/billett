(function() {
    'use strict';

    var module = angular.module('billett.admin.event');

    module.factory('AdminEvent', function ($resource, $http) {
        var r = $resource('api/event/:id', {
            'id': '@id',
            'admin': 1
        }, {
            update: {method: 'PUT'}
        });

        r.prototype.setPublish = function (state) {
            return $http.patch('api/event/' + this.id, {
                'is_published': state,
                'admin': 1
            });
        };

        r.prototype.setSelling = function (state) {
            return $http.patch('api/event/' + this.id, {
                'is_selling': state,
                'admin': 1
            });
        };

        return r;
    });
})();
