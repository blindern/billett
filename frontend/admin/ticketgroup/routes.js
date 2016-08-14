angular.module('billett.admin').config(function ($stateProvider) {
    $stateProvider
        .state('admin-ticketgroup-new', {
            url: '/a/event/:id/ticketgroup/new',
            templateProvider: ($q) => {
                  return $q((resolve) => {
                        // lazy load the view
                        require.ensure([], () => resolve(require('!!html!./new.html')));
                  });
            },
            controller: 'AdminTicketgroupNewController',
            resolve: {auth: 'AuthRequireResolver'}
        })
        .state('admin-ticketgroup', {
            url: '/a/event/:event_id/ticketgroup/:ticketgroup_id',
            templateProvider: ($q) => {
                  return $q((resolve) => {
                        // lazy load the view
                        require.ensure([], () => resolve(require('!!html!./index.html')));
                  });
            },
            controller: 'AdminTicketgroupController',
            resolve: {auth: 'AuthRequireResolver'}
        });
});
