(function() {
    'use strict';

    var module = angular.module('billett.admin');

    module.config(function($routeProvider) {
        $routeProvider.when('/a/event/:id/edit', {
            templateUrl: 'assets/views/admin/event/edit.html',
            controller: 'AdminEventEditNewController',
            resolve: {auth: 'AuthRequireResolver'}
        });

        $routeProvider.when('/a/eventgroup/:group_id/new_event', {
            templateUrl: 'assets/views/admin/event/edit.html',
            controller: 'AdminEventEditNewController',
            resolve: {auth: 'AuthRequireResolver'}
        });
    });

    module.controller('AdminEventEditNewController', function (Page, AdminEventgroup, $routeParams, $rootScope, $scope, AdminEvent, $location, $window, $timeout) {
        var is_new = $scope.is_new = !('id' in $routeParams);

        var loader = Page.setLoading();
        if (is_new) {
            Page.setTitle('Nytt arrangement');
            $scope.eventgroup_id = $routeParams['group_id'];
            $scope.event = {
                max_sales: 0,
                max_each_person: 10
            };

            AdminEventgroup.get({id: $routeParams['group_id']}, function (ret) {
                $scope.group = ret;
                loader();
            }, function () {
                loader();
                Page.set404();
            });
        }

        else {
            Page.setTitle('Rediger arrangement');

            AdminEvent.get({id: $routeParams['id']}, function (ret) {
                loader();
                $scope.event = ret;
                $scope.group = ret.eventgroup;

                var parseTime = function (t) {
                    if (!t) return;
                    return moment.unix(t).format('DD.MM.YYYY HH:mm');
                };

                $scope.time_start_text = parseTime($scope.event.time_start);
                $scope.time_end_text = parseTime($scope.event.time_end);
            }, function () {
                loader();
                Page.set404();
            });
        }

        $scope.updateTime = function (which) {
            var x =
                moment(
                    $scope[which == 'start' ? 'time_start_text' : 'time_end_text'],
                    'DD.MM.YYYY HH:mm'
                ).unix();
            if (x < 0) x = 0;
            $scope.event[which == 'start' ? 'time_start' : 'time_end'] = x;
        };

        $scope.storeEvent = function () {
            if (isNaN($scope.event.time_start)) return;

            if (is_new) {
                var e = new AdminEvent($scope.event);
                e.group_id = $scope.eventgroup_id;
                e.$save(function (res) {
                    $location.path('/a/event/' + res.id);
                }, function (err) {
                    alert(err.data);
                });
            } else {
                $scope.event.$update(function (res) {
                    // go to previous page or redirect to event admin page
                    var timer = $timeout(function () {
                        $location.path('/a/event/' + res.id);
                    }, 100);
                    var ev = $rootScope.$on('$routeChangeStart', function (event, next, current) {
                        ev();
                        $timeout.cancel(timer);
                    });
                    $window.history.back();
                }, function (err) {
                    alert(err.data);
                });
            }
        };
    });
})();
