(function() {
    'use strict';

    var module = angular.module('billett.common.PageController', [
        'ngAnimate',
        'ngToast'
    ]);

    // global page
    module.controller('PageController', function (Page, $scope, $location, $rootScope) {
        $scope.isAdminPage = function () {
            return $location.path().substring(0, 3) == '/a/';
        };
        $scope.isDevPage = !!window.is_dev;
        $scope.isDibsTest = !!window.is_dibs_test;

        $rootScope.$on('$routeChangeStart', function () {
            Page.setDefault('url', $location.absUrl());
        });

        $rootScope.absBaseUrl = $location.absUrl().slice(0, -$location.url().length) + "/";
    });
})();
