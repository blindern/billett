angular.module('billett.admin').config(function($stateProvider) {
    $stateProvider
        .state('admin-event-new', {
            url: '/a/eventgroup/:eventgroup_id/new_event',
            templateProvider: ($q) => {
                return $q((resolve) => {
                    // lazy load the view
                    require.ensure([], () => resolve(require('!!html!./edit.html')));
                });
            },
            controller: 'AdminEventEditNewController',
            resolve: {auth: 'AuthRequireResolver'}
        })
        .state('admin-event-edit', {
            url: '/a/event/:id/edit',
            templateProvider: ($q) => {
                return $q((resolve) => {
                    // lazy load the view
                    require.ensure([], () => resolve(require('!!html!./edit.html')));
                });
            },
            controller: 'AdminEventEditNewController',
            resolve: {auth: 'AuthRequireResolver'}
        })
        .state('admin-event-checkin', {
            url: '/a/event/:id/checkin',
            //TODO template: require('./checkin.html'),
            controller: 'AdminCheckinController',
            resolve: {auth: 'AuthRequireResolver'}
        })
        .state('admin-event', {
            url: '/a/event/:id',
            templateProvider: ($q) => {
                return $q((resolve) => {
                    // lazy load the view
                    require.ensure([], () => resolve(require('!!html!./index.html')));
                });
            },
            controller: 'AdminEventController as ctrl',
            resolve: {auth: 'AuthRequireResolver'}
        });
});
