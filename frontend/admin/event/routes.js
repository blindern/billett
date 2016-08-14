angular.module('billett.admin').config(function($stateProvider) {
    $stateProvider
        .state('admin-event-new', {
            url: '/a/eventgroup/:eventgroup_id/new_event',
            templateUrl: require('./edit.html'),
            controller: 'AdminEventEditNewController',
            resolve: {auth: 'AuthRequireResolver'}
        })
        .state('admin-event-edit', {
            url: '/a/event/:id/edit',
            templateUrl: require('./edit.html'),
            controller: 'AdminEventEditNewController',
            resolve: {auth: 'AuthRequireResolver'}
        })
        .state('admin-event-checkin', {
            url: '/a/event/:id/checkin',
            //TODO templateUrl: require('./checkin.html'),
            controller: 'AdminCheckinController',
            resolve: {auth: 'AuthRequireResolver'}
        })
        .state('admin-event', {
            url: '/a/event/:id',
            templateUrl: require('./index.html'),
            controller: 'AdminEventController as ctrl',
            resolve: {auth: 'AuthRequireResolver'}
        });
});
