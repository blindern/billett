'use strict';

angular.module('billett.admin.eventgroup', [
    'ngRoute',
    'billett.helper.page'
])

.config(function($routeProvider) {
    $routeProvider.when('/a/eventgroup/:id', {
        templateUrl: 'views/admin/eventgroup/index.html',
        controller: 'AdminEventGroupController'
    });
})

.controller('AdminEventGroupController', function(Page, $routeParams) {
    // TODO
});
