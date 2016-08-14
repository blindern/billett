
angular.module('billett.admin').config(function ($stateProvider) {
    $stateProvider
        .state('admin-eventgroup-new', {
            url: '/a/eventgroup/new',
            templateProvider: ($q) => {
                return $q((resolve) => {
                    // lazy load the view
                    require.ensure([], () => resolve(require('!!html!./edit.html')));
                });
            },
            controller: 'AdminEventgroupEditNewController',
            resolve: {auth: 'AuthRequireResolver'}
        })
        .state('admin-eventgroup-edit', {
            url: '/a/eventgroup/:id/edit',
            templateProvider: ($q) => {
                return $q((resolve) => {
                    // lazy load the view
                    require.ensure([], () => resolve(require('!!html!./edit.html')));
                });
            },
            controller: 'AdminEventgroupEditNewController',
            resolve: {auth: 'AuthRequireResolver'}
        })
        .state('admin-eventgroup', {
            url: '/a/eventgroup/:id',
            templateProvider: ($q) => {
                return $q((resolve) => {
                    // lazy load the view
                    require.ensure([], () => resolve(require('!!html!./index.html')));
                });
            },
            controller: 'AdminEventgroupController',
            resolve: {auth: 'AuthRequireResolver'}
        })
        .state('admin-sold-tickets-stats', {
            url: '/a/eventgroup/:id/sold_tickets_stats',
            templateProvider: ($q) => {
                return $q((resolve) => {
                    // lazy load the view
                    require.ensure([], () => resolve(require('!!html!./sold_tickets_stats.html')));
                });
            },
            controller: 'AdminEventgroupSoldTicketsStatsController as ctrl',
            resolve: {auth: 'AuthRequireResolver'}
        });
});
