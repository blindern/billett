'use strict';

angular.module('billett.admin.ticketgroup', [
    'ngRoute',
    'billett.helper.page'
])

.config(function($routeProvider) {
    $routeProvider.when('/a/ticketgroup/:id', {
        templateUrl: 'views/admin/ticketgroup/index.html',
        controller: 'AdminTicketGroupController'
    });
})

.controller('AdminTicketGroupController', function(Page, $routeParams) {
    // TODO
});
