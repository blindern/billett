'use strict';

angular.module('billett.admin.event', [
    'ngRoute',
    'billett.helper.page'
])

.config(function($routeProvider) {
    $routeProvider.when('/a/event/:id', {
        templateUrl: 'views/admin/event/index.html',
        controller: 'AdminEventController'
    }).

    when('/a/eventgroup/:id/new_event', {
        templateUrl: 'views/admin/event/new.html',
        controller: 'AdminEventNewController'
    }).

    // checkin handling
    when('/a/event/:id/checkin', {
        templateUrl: 'views/admin/event/checkin.html',
        controller: 'AdminCheckinController'
    });
})

.controller('AdminEventController', function(Page, $routeParams) {
    // TODO
})

.controller('AdminEventNewController', function(Page, $routeParams, $scope, $http) {
    $scope.eventgroup_id = $routeParams['id'];

    /*$http.get('api/eventgroup/'+encodeURIComponent($routeParams['id'])).success(function(ret) {
        Page.setTitle(ret.title);
        $scope.group = ret;
    });*/
})

.controller('AdminCheckinController', function(Page, $routeParams) {
    // TODO
});
