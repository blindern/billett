(function() {
    'use strict';

    var module = angular.module('billett.admin.event');

    module.config(function($routeProvider) {
        $routeProvider.when('/a/event/:id/checkin', {
            templateUrl: 'assets/views/admin/event/checkin.html',
            controller: 'AdminCheckinController',
            resolve: {auth: 'AuthRequireResolver'}
        });
    });

    module.controller('AdminCheckinController', function (Page, $routeParams) {
        // TODO
    });
})();
