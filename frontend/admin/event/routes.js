angular.module('billett.admin').config(function($stateProvider) {
    $stateProvider
        .state('admin-event-new', {
            url: '/a/eventgroup/:group_id/new_event',
            templateUrl: 'assets/views/admin/event/edit.html',
            controller: 'AdminEventEditNewController',
            resolve: {auth: 'AuthRequireResolver'}
        })
        .state('admin-event-edit', {
            url: '/a/event/:id/edit',
            templateUrl: 'assets/views/admin/event/edit.html',
            controller: 'AdminEventEditNewController',
            resolve: {auth: 'AuthRequireResolver'}
        })
        .state('admin-event-checkin', {
            url: '/a/event/:id/checkin',
            templateUrl: 'assets/views/admin/event/checkin.html',
            controller: 'AdminCheckinController',
            resolve: {auth: 'AuthRequireResolver'}
        })
        .state('admin-event', {
            url: '/a/event/:id',
            templateUrl: 'assets/views/admin/event/index.html',
            controller: 'AdminEventController as ctrl',
            resolve: {auth: 'AuthRequireResolver'}
        });
});
