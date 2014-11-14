'use strict';

angular.module('billett.admin.eventgroup', [
    'ngRoute',
    'billett.helper.page'
])

.config(function($routeProvider) {
    $routeProvider
        .when('/a/eventgroup/new', {
            templateUrl: 'views/admin/eventgroup/new.html',
            controller: 'AdminEventGroupNewController'
        })
        .when('/a/eventgroup/:id', {
            templateUrl: 'views/admin/eventgroup/index.html',
            controller: 'AdminEventGroupController'
        });
})

.controller('AdminEventGroupNewController', function(Page, $routeParams) {
    Page.setTitle('Ny arrangementgruppe');
})

.controller('AdminEventGroupController', function(Page, $routeParams, $http, $scope) {
    Page.setTitle('Arrangementgruppe');

    $http.get('api/eventgroup/'+encodeURIComponent($routeParams['id'])).success(function(ret) {
        Page.setTitle(ret.title);
        $scope.group = ret;
    });
});
