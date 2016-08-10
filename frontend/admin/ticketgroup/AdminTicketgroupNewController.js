(function() {
    'use strict';

    var module = angular.module('billett.admin');

    module.controller('AdminTicketgroupNewController', function (Page, $stateParams,
                                                                 AdminTicketgroup, AdminEvent, $scope, $location) {
        $scope.event_id = $stateParams['id'];
        $scope.ticketgroup = {
            price: 0,
            is_normal: true
        };

        var loader = Page.setLoading();
        AdminEvent.get({id: $stateParams['id']}, function (ret) {
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
