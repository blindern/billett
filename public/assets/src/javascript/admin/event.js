'use strict';

angular.module('billett.admin.event', [
    'ngRoute',
    'billett.helper.page'
])

.config(function($routeProvider) {
    $routeProvider.when('/a/event/:id', {
        templateUrl: 'views/admin/event/index.html',
        controller: 'AdminEventController'
    }).

    // checkin handling
    when('/a/event/:id/checkin', {
        templateUrl: 'views/admin/event/checkin.html',
        controller: 'AdminCheckinController'
    });
})

.controller('AdminEventController', function(Page, $routeParams) {
    // TODO
})

.controller('AdminCheckinController', function(Page, $routeParams) {
    // TODO
});
