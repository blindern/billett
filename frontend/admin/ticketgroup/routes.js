angular.module('billett.admin').config(function ($stateProvider) {
    $stateProvider
        .state('admin-ticketgroup-new', {
            url: '/a/event/:id/ticketgroup/new',
            templateUrl: require('./new.html'),
            controller: 'AdminTicketgroupNewController',
            resolve: {auth: 'AuthRequireResolver'}
        })
        .state('admin-ticketgroup', {
            url: '/a/event/:event_id/ticketgroup/:ticketgroup_id',
            templateUrl: require('./index.html'),
            controller: 'AdminTicketgroupController',
            resolve: {auth: 'AuthRequireResolver'}
        });
});
