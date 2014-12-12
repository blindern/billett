(function() {
    'use strict';

    var module = angular.module('billett.admin.ticketgroup');

    module.config(function ($routeProvider) {
        $routeProvider.when('/a/event/:event_id/ticketgroup/:ticketgroup_id', {
            templateUrl: 'assets/views/admin/ticketgroup/index.html',
            controller: 'AdminTicketgroupController',
            resolve: {auth: 'AuthRequireResolver'}
        });
    });

    module.controller('AdminTicketgroupController', function (Page, $routeParams,
                                                              AdminTicketgroup, $scope, $location) {
        Page.setTitle('Billettgruppe');

        $scope.event_id = $routeParams['event_id'];
        $scope.ticketgroup_id = $routeParams['ticketgroup_id'];

        var loader = Page.setLoading();
        AdminTicketgroup.get({id: $scope.ticketgroup_id}, function (ret) {
            loader();
            if (ret.event.id != $scope.event_id) {
                $location.path('/a');
                return;
            }

            ret.is_active = !!ret.is_active;
            ret.is_published = !!ret.is_published;
            ret.is_normal = !!ret.is_normal;

            $scope.ticketgroup = ret;
        }, function (err) {
            $location.path('/a/event/' + $scope.event_id);
        });

        $scope.updateTicketgroup = function () {
            $scope.ticketgroup.$update(function (ret) {
                $location.path('/a/event/' + $scope.event_id);
            });
        };

        $scope.deleteTicketgroup = function () {
            // TODO: no delete on valid/reserved tickets
            AdminTicketgroup.delete({id: $scope.ticketgroup_id}, function (res) {
                $location.path('/a/event/' + $scope.event_id);
            });
        };
    });
})();
