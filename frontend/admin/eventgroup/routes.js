angular.module('billett.admin').config(function ($routeProvider) {
    $routeProvider
        .when('/a/eventgroup/new', {
            templateUrl: 'assets/views/admin/eventgroup/new.html',
            controller: 'AdminEventgroupNewController',
            resolve: {auth: 'AuthRequireResolver'}
        })
        .when('/a/eventgroup/:id', {
            templateUrl: 'assets/views/admin/eventgroup/index.html',
            controller: 'AdminEventgroupController',
            resolve: {auth: 'AuthRequireResolver'}
        })
        .when('/a/eventgroup/:id/sold_tickets_stats', {
            templateUrl: 'assets/views/admin/eventgroup/sold_tickets_stats.html',
            controller: 'AdminEventgroupSoldTicketsStatsController as ctrl',
            resolve: {auth: 'AuthRequireResolver'}
        })
        .when('/a/eventgroup/:id/sell', {
            templateUrl: 'assets/views/admin/eventgroup/sell.html',
            controller: 'AdminEventgroupSellController as ctrl',
            resolve: {auth: 'AuthRequireResolver'}
        });
});
