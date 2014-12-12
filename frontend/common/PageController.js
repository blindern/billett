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

        $rootScope.$on('$routeChangeStart', function () {
            Page.setDefault('url', $location.absUrl());
        });
    });
})();
