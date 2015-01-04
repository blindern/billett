angular.module('billett.admin').config(function($routeProvider) {
    $routeProvider
        .when('/a/eventgroup/:group_id/new_event', {
            templateUrl: 'assets/views/admin/event/edit.html',
            controller: 'AdminEventEditNewController',
            resolve: {auth: 'AuthRequireResolver'}
        })
        .when('/a/event/:id/edit', {
            templateUrl: 'assets/views/admin/event/edit.html',
            controller: 'AdminEventEditNewController',
            resolve: {auth: 'AuthRequireResolver'}
        })
        .when('/a/event/:id/checkin', {
            templateUrl: 'assets/views/admin/event/checkin.html',
            controller: 'AdminCheckinController',
            resolve: {auth: 'AuthRequireResolver'}
        })
        .when('/a/event/:id', {
            templateUrl: 'assets/views/admin/event/index.html',
            controller: 'AdminEventController',
            resolve: {auth: 'AuthRequireResolver'}
        });
});
