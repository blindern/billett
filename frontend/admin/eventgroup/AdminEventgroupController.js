(function() {
    'use strict';

    var module = angular.module('billett.admin');

    module.controller('AdminEventgroupController', function (Page, $routeParams, $http, $scope, AdminEventgroup, AdminEvent, $location) {
        Page.setTitle('Arrangementgruppe');

        var loader = Page.setLoading();
        AdminEventgroup.get({id: $routeParams['id']}, function (ret) {
            loader();
            Page.setTitle(ret.title);

            $scope.group = ret;
            $scope.applyFilter();

            $scope.categories = [];
            angular.forEach($scope.group.events, function (event) {
                if ($scope.categories.indexOf(event.category || '') != -1) return;
                $scope.categories.push(event.category || '');
            });
            $scope.categories.sort();
        }, function () {
            loader();
            Page.set404();
        });

        $scope.filter_sale = "";
        $scope.filter_category = '-1';
        $scope.filter_hidden = '0';
        $scope.applyFilter = function () {
            var r = {};
            angular.forEach($scope.group.events, function (item) {
                if ($scope.filter_sale !== "" && $scope.filter_sale != !!item.ticketgroups.length)
                    return;
                if ($scope.filter_category !== '-1' && $scope.filter_category != (item.category || ''))
                    return;
                if ($scope.filter_hidden != '' && $scope.filter_hidden != item.is_admin_hidden)
                    return;

                var k = moment.unix(item.time_start - 3600 * 6).format('YYYY-MM-DD');
                r[k] = r[k] || [];
                r[k].push(item);
            });

            $scope.days = r;
        };

        $scope.eventTogglePublish = function (event) {
            new AdminEvent(event).setPublish(!event.is_published).success(function (ret) {
                event.is_published = ret.is_published;
            });
        };

        $scope.eventToggleSelling = function (event) {
            new AdminEvent(event).setSelling(!event.is_selling).success(function (ret) {
                event.is_selling = ret.is_selling;
            });
        };
    });
})();
