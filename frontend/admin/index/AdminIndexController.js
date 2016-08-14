(function() {
    'use strict';

    var module = angular.module('billett.admin');

    module.config(function ($stateProvider) {
        $stateProvider.state('admin-index', {
            url: '/a',
            templateProvider: ($q) => {
                return $q((resolve) => {
                    // lazy load the view
                    require.ensure([], () => resolve(require('!!html!./index.html')));
                });
            },
            controller: 'AdminIndexController',
            resolve: {auth: 'AuthRequireResolver'}
        });
    });

    module.controller('AdminIndexController', function (Page, $http, $scope, AdminEventgroup, AdminPrinter) {
        AdminEventgroup.query(function (ret) {
            $scope.eventgroups = ret;
        });

        $scope.printText = function () {
            AdminPrinter.printTextModal();
        };
    });
})();
