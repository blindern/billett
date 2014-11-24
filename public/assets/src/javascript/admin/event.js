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

.controller('AdminEventController', function(Page, $routeParams, AdminEvent, $location, $scope) {
    Page.setTitle("Arrangement");

    AdminEvent.get({id:$routeParams['id']}, function(ret) {
        $scope.event = ret;
    }, function(err) {
        $location.path('/a');
    });

    $scope.deleteEvent = function() {
        var group = $scope.event.eventgroup.id;
        $scope.event.$delete(function() {
            $location.path('/a/eventgroup/'+group);
        }, function(err) {
            alert(err);
        });
    };
})

.controller('AdminEventNewController', function(Page, $routeParams, $scope, AdminEventGroup, AdminEvent, $location) {
    Page.setTitle('Nytt arrangement');
    $scope.eventgroup_id = $routeParams['id'];
    $scope.event = {
        max_sales: 100,
        max_each_person: 10
    };

    AdminEventGroup.get({id:$routeParams['id']}, function(ret) {
        $scope.group = ret;
    }, function(err) {
        $location.path('/a');
    });

    $scope.updateTime = function(which) {
        $scope.event[which == 'start' ? 'time_start' : 'time_end'] =
                moment(
                    $scope[which == 'start' ? 'time_start_text' : 'time_end_text'],
                    'DD.MM.YYYY HH:mm'
                ).unix();
    };

    $scope.addEvent = function() {
        if (isNaN($scope.event.time_start)) return;

        var e = new AdminEvent($scope.event);
        e.group_id = $scope.eventgroup_id;
        e.$save(function(res) {
            $location.path('/a/event/'+res.id);
        }, function(err) {
            alert(err.data);
        });
    };
})

.controller('AdminCheckinController', function(Page, $routeParams) {
    // TODO
})

.factory('AdminEvent', function($resource) {
    var r = $resource('api/event/:id', {
        'id': '@id'
    }, {

    });

    return r;
});
