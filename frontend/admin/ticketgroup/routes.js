angular.module('billett.admin').config(function ($routeProvider) {
    $routeProvider
        .when('/a/event/:id/ticketgroup/new', {
            templateUrl: 'assets/views/admin/ticketgroup/new.html',
            controller: 'AdminTicketgroupNewController',
            resolve: {auth: 'AuthRequireResolver'}
        })
        .when('/a/event/:event_id/ticketgroup/:ticketgroup_id', {
            templateUrl: 'assets/views/admin/ticketgroup/index.html',
            controller: 'AdminTicketgroupController',
            resolve: {auth: 'AuthRequireResolver'}
        });
});
