'use strict';

angular.module('billett.admin.eventgroup', [
    'ngRoute',
    'ngResource',
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

.controller('AdminEventGroupController', function(Page, $routeParams, $http, $scope, AdminEventGroup) {
    Page.setTitle('Arrangementgruppe');

    AdminEventGroup.get({id:$routeParams['id']}, function(ret) {
        Page.setTitle(ret.title);

        var r = {};
        angular.forEach(ret.events, function(item) {
            var k = moment.unix(item.time_start).format('YYYY-MM-DD');
            r[k] = r[k] || [];
            r[k].push(item);
        });

        $scope.group = ret;
        $scope.days = r;
    });
})

.factory('AdminEventGroup', function($resource) {
    var r = $resource('api/eventgroup/:id', {
        'id': '@id'
    }, {

    });

    return r;
});