angular.module('billett.admin').config(function ($stateProvider) {
    $stateProvider
        .state('admin-ticketgroup-new', {
            url: '/a/event/:id/ticketgroup/new',
            templateUrl: 'assets/views/admin/ticketgroup/new.html',
            controller: 'AdminTicketgroupNewController',
            resolve: {auth: 'AuthRequireResolver'}
        })
        .state('admin-ticketgroup', {
            url: '/a/event/:event_id/ticketgroup/:ticketgroup_id',
            templateUrl: 'assets/views/admin/ticketgroup/index.html',
            controller: 'AdminTicketgroupController',
            resolve: {auth: 'AuthRequireResolver'}
        });
});
