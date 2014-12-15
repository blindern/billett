(function() {
    'use strict';

    var module = angular.module('billett.eventgroup', [
        'ngRoute',
        'billett.common.PageService'
    ]);

    module.config(function ($routeProvider) {
        $routeProvider.when('/eventgroup/:id/:query?', {
            templateUrl: 'assets/views/guest/eventgroup/index.html',
            controller: 'EventgroupController'
        });
    });

    module.controller('EventgroupController', function (Page, $http, $scope, $routeParams, $location) {
        Page.setTitle('Arrangementgruppe');

        var filter = {
            date: null,
            category: null
        };
        $scope.isFilter = false;
        if ($routeParams['query']) {
            var date = moment($routeParams['query'], 'YYYY-MM-DD');
            if (date.isValid()) {
                filter.date = date.format('YYYY-MM-DD');
            } else {
                filter.category = $routeParams['query'];
            }
            $scope.isFilter = true;
        }

        var loader = Page.setLoading();
        $http.get('api/eventgroup/' + encodeURIComponent($routeParams['id'])).success(function (ret) {
            loader();
            Page.setTitle(ret.title);
            $scope.group = ret;

            var r = {};
            var c = 0;
            angular.forEach($scope.group.events, function (item) {
                if (filter.category && filter.category != (item.category||'').toLowerCase()) return;

                var k = moment.unix(item.time_start - 3600 * 6).format('YYYY-MM-DD');
                if (filter.date && filter.date != k) return;

                r[k] = r[k] || [];
                r[k].push(item);
                c++;
            });

            // redirect if blank page on filter
            if (c == 0 && (filter.date || filter.category)) {
                $location.path('eventgroup/' + ret.id);
            }

            $scope.days = r;
        }).error(function () {
            loader();
            Page.set404();
        });

        var categories = [];
        $scope.categoryNum = function (category) {
            var i = categories.indexOf(category);
            if (i == -1) {
                i = categories.push(category) - 1;
            }
            return i;
        }
    });
})();
