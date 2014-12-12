(function() {
    'use strict';

    var module = angular.module('billett.eventgroup', [
        'ngRoute',
        'billett.common.PageService'
    ]);

    module.config(function ($routeProvider) {
        $routeProvider.when('/eventgroup/:id', {
            templateUrl: 'assets/views/guest/eventgroup/index.html',
            controller: 'EventgroupController'
        });
    });

    module.controller('EventgroupController', function (Page, $http, $scope, $routeParams) {
        Page.setTitle('Arrangementgruppe');

        var loader = Page.setLoading();
        $http.get('api/eventgroup/' + encodeURIComponent($routeParams['id'])).success(function (ret) {
            loader();
            Page.setTitle(ret.title);
            $scope.group = ret;

            var r = {};
            angular.forEach($scope.group.events, function (item) {
                var k = moment.unix(item.time_start - 3600 * 6).format('YYYY-MM-DD');
                r[k] = r[k] || [];
                r[k].push(item);
            });

            $scope.days = r;
        }).error(function () {
            $location.path('/');
        });
    });
})();
