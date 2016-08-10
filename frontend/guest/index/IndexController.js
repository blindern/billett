(function() {
    'use strict';

    var module = angular.module('billett.guest');

    module.config(function ($stateProvider) {
        $stateProvider.state('index', {
            url: '/',
            templateUrl: 'assets/views/guest/index/index.html',
            controller: 'IndexController'
        });
    });

    module.controller('IndexController', function (Page, $http, $scope) {
        Page.setTitle('Arrangementer');

        $http.get('api/event/get_upcoming').success(function (ret) {
            $scope.upcoming = ret;
        });

        $http.get('api/eventgroup').success(function (ret) {
            $scope.eventgroups = ret;
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
