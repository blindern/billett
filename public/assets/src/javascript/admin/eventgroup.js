'use strict';

angular.module('billett.admin.eventgroup', [
    'ngRoute',
    'ngResource',
    'billett.auth',
    'billett.helper.page',
    'ui.unique'
])

.config(function($routeProvider) {
    $routeProvider
        .when('/a/eventgroup/new', {
            templateUrl: 'views/admin/eventgroup/new.html',
            controller: 'AdminEventgroupNewController',
            resolve: {auth: 'AuthRequireResolver'}
        })
        .when('/a/eventgroup/:id', {
            templateUrl: 'views/admin/eventgroup/index.html',
            controller: 'AdminEventgroupController',
            resolve: {auth: 'AuthRequireResolver'}
        });
})

.controller('AdminEventgroupNewController', function(Page, $routeParams) {
    Page.setTitle('Ny arrangementgruppe');
})

.controller('AdminEventgroupController', function(Page, $routeParams, $http, $scope, AdminEventgroup, AdminEvent) {
    Page.setTitle('Arrangementgruppe');

    AdminEventgroup.get({id:$routeParams['id']}, function(ret) {
        Page.setTitle(ret.title);

        $scope.group = ret;
        $scope.applyFilter();
    });

    $scope.filter_sale = "";
    $scope.filter_category = 'all';
    $scope.filter_hidden = '0';
    $scope.applyFilter = function() {
        var r = {};
        angular.forEach($scope.group.events, function(item) {
            if ($scope.filter_sale !== "" && $scope.filter_sale != !!item.ticketgroups.length)
                return;
            if ($scope.filter_category !== 'all' && $scope.filter_category != item.category)
                return;
            if ($scope.filter_hidden != '' && $scope.filter_hidden != item.is_admin_hidden)
                return;

            var k = moment.unix(item.time_start-3600*6).format('YYYY-MM-DD');
            r[k] = r[k] || [];
            r[k].push(item);
        });

        $scope.days = r;
    };

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
        'id': '@id',
        'admin': 1
    }, {
        update: { method: 'PUT' }
    });

    return r;
});