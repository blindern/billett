'use strict';

angular.module('billett.admin.ticketgroup', [
    'ngRoute',
    'ngResource',
    'billett.helper.page'
])

.config(function($routeProvider) {
    $routeProvider.when('/a/event/:id/ticketgroup/new', {
        templateUrl: 'views/admin/ticketgroup/new.html',
        controller: 'AdminTicketgroupNewController'
    })
    .when('/a/event/:event_id/ticketgroup/:ticketgroup_id', {
        templateUrl: 'views/admin/ticketgroup/index.html',
        controller: 'AdminTicketgroupController'
    });
})

.controller('AdminTicketgroupController', function(Page, $routeParams,
        AdminTicketgroup, $scope, $location) {
    Page.setTitle('Billettgruppe');

    $scope.event_id = $routeParams['event_id'];
    $scope.ticketgroup_id = $routeParams['ticketgroup_id'];

    AdminTicketgroup.get({id:$scope.ticketgroup_id}, function(ret) {
        if (ret.event.id != $scope.event_id) {
            $location.path('/a');
            return;
        }

        ret.is_active = !!ret.is_active;
        ret.is_published = !!ret.is_published;
        ret.is_normal = !!ret.is_normal;

        $scope.ticketgroup = ret;
    }, function(err) {
        $location.path('/a/event/'+$scope.event_id);
    });

    $scope.updateTicketgroup = function() {
        $scope.ticketgroup.$update(function(ret) {
            $location.path('/a/event/'+$scope.event_id);
        });
    };

    $scope.deleteTicketgroup = function() {
        // TODO: no delete on valid/reserved tickets
        AdminTicketgroup.delete({id: $scope.ticketgroup_id}, function(res) {
            $location.path('/a/event/'+$scope.event_id);
        });
    };
})

.controller('AdminTicketgroupNewController', function(Page, $routeParams,
        AdminTicketgroup, AdminEvent, $scope, $location) {
    Page.setTitle('Ny billettgruppe');

    $scope.event_id = $routeParams['id'];
    $scope.ticketgroup = {
        price: 0,
        is_normal: true
    };

    AdminEvent.get({id:$routeParams['id']}, function(ret) {
        $scope.event = ret;
    }, function(err) {
        $location.path('/a');
    });

    $scope.addTicketgroup = function() {
        var g = new AdminTicketgroup($scope.ticketgroup);
        g.event_id = $scope.event_id;
        g.$save(function(res) {
            $location.path('/a/event/'+g.event_id);
        }, function(err) {
            alert(err.data);
        });
    };
})

.factory('AdminTicketgroup', function($resource) {
    var r = $resource('api/ticketgroup/:id', {
        'id': '@id'
    }, {
        update: { method: 'PUT' }
    });

    return r;
});
