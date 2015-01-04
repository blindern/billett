(function() {
    'use strict';

    var module = angular.module('billett.admin');

    module.controller('AdminTicketgroupNewController', function (Page, $routeParams,
                                                                 AdminTicketgroup, AdminEvent, $scope, $location) {
        Page.setTitle('Ny billettgruppe');

        $scope.event_id = $routeParams['id'];
        $scope.ticketgroup = {
            price: 0,
            is_normal: true
        };

        var loader = Page.setLoading();
        AdminEvent.get({id: $routeParams['id']}, function (ret) {
            loader();
            $scope.event = ret;
        }, function () {
            loader();
            Page.set404();
        });

        $scope.addTicketgroup = function () {
            var g = new AdminTicketgroup($scope.ticketgroup);
            g.event_id = $scope.event_id;
            g.$save(function (res) {
                $location.path('/a/event/' + g.event_id);
            }, function (err) {
                alert(err.data);
            });
        };
    });
})();
