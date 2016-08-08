
angular.module('billett.admin').config(function ($stateProvider) {
    $stateProvider
        .state('admin-eventgroup-new', {
            url: '/a/eventgroup/new',
            templateUrl: 'assets/views/admin/eventgroup/edit.html',
            controller: 'AdminEventgroupEditNewController',
            resolve: {auth: 'AuthRequireResolver'}
        })
        .state('admin-eventgroup-edit', {
            url: '/a/eventgroup/:eventgroup_id/edit',
            templateUrl: 'assets/views/admin/eventgroup/edit.html',
            controller: 'AdminEventgroupEditNewController',
            resolve: {auth: 'AuthRequireResolver'}
        })
        .state('admin-eventgroup', {
            url: '/a/eventgroup/:id',
            templateUrl: 'assets/views/admin/eventgroup/index.html',
            controller: 'AdminEventgroupController',
            resolve: {auth: 'AuthRequireResolver'}
        })
        .state('admin-sold-tickets-stats', {
            url: '/a/eventgroup/:id/sold_tickets_stats',
            templateUrl: 'assets/views/admin/eventgroup/sold_tickets_stats.html',
            controller: 'AdminEventgroupSoldTicketsStatsController as ctrl',
            resolve: {auth: 'AuthRequireResolver'}
        });
});
