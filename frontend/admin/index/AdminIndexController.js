(function() {
    'use strict';

    var module = angular.module('billett.admin');

    module.config(function ($routeProvider) {
        $routeProvider.when('/a', {
            templateUrl: 'assets/views/admin/index/index.html',
            controller: 'AdminIndexController',
            resolve: {auth: 'AuthRequireResolver'}
        });
    });

    module.controller('AdminIndexController', function (Page, $http, $scope, AdminEventgroup) {
        AdminEventgroup.query(function (ret) {
            $scope.eventgroups = ret;
        });
    });
})();
