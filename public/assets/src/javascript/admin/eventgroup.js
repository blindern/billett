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
            controller: 'AdminEventgroupNewController'
        })
        .when('/a/eventgroup/:id', {
            templateUrl: 'views/admin/eventgroup/index.html',
            controller: 'AdminEventgroupController'
        });
})

.controller('AdminEventgroupNewController', function(Page, $routeParams) {
    Page.setTitle('Ny arrangementgruppe');
})

.controller('AdminEventgroupController', function(Page, $routeParams, $http, $scope, AdminEventgroup, AdminEvent) {
    Page.setTitle('Arrangementgruppe');

    AdminEventgroup.get({id:$routeParams['id']}, function(ret) {
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

    $scope.eventTogglePublish = function(event) {
        new AdminEvent(event).setPublish(!event.is_published).success(function(ret) {
            event.is_published = ret.is_published;
        });
    };

    $scope.eventToggleSelling = function(event) {
        new AdminEvent(event).setSelling(!event.is_selling).success(function(ret) {
            event.is_selling = ret.is_selling;
        });
    };
})

.factory('AdminEventgroup', function($resource) {
    var r = $resource('api/eventgroup/:id', {
        'id': '@id'
    }, {

    });

    return r;
});