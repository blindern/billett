(function() {
    'use strict';

    var module = angular.module('billett.index', [
        'ngRoute',
        'billett.common.PageService'
    ]);

    module.config(function ($routeProvider) {
        $routeProvider.when('/', {
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
    });
})();
