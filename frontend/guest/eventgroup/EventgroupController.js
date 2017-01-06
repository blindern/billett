import {api} from '../../api';

(function() {
    'use strict';

    var module = angular.module('billett.guest');

    module.config(function ($stateProvider) {
        $stateProvider
            .state('eventgroup', {
                url: '/eventgroup/{id}{query:(?:/[^/]*)?}',
                templateUrl: require('./index.html'),
                controller: 'EventgroupController'
            });
    });

    module.controller('EventgroupController', function (AuthService, Page, $http, $scope, $stateParams, $location) {
        Page.setTitle('Arrangementgruppe');

        $scope.has_role_admin = false;
        AuthService.hasRole('billett.admin').then(res => {
            $scope.has_role_admin = res;
        });

        $scope.daythemes = {};

        var filter = {
            date: null,
            category: null
        };
        $scope.isFilter = false;
        if ($stateParams['query']) {
            $stateParams['query'] = $stateParams['query'].substring(1); // remove leading slash
            var date = moment($stateParams['query'], 'YYYY-MM-DD');
            if (date.isValid()) {
                filter.date = date.format('YYYY-MM-DD');
            } else {
                filter.category = $stateParams['query'];
            }
            $scope.isFilter = true;
        }

        var loader = Page.setLoading();
        $http.get(api('eventgroup/' + encodeURIComponent($stateParams['id']))).success(function (ret) {
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

            angular.forEach($scope.group.daythemes, function (item) {
                var day = moment.unix(item.date).format('YYYY-MM-DD');
                $scope.daythemes[day] = item.title;
            });

            // if blank page on filter
            if (c == 0 && (filter.date || filter.category)) {
                Page.set404();
                //$location.path('eventgroup/' + ret.id);
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
