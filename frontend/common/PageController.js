(function() {
    'use strict';

    var module = angular.module('billett.common.PageController', [
        'ngAnimate',
        'ngToast'
    ]);

    // global page
    module.controller('PageController', function ($scope, $location) {
        $scope.isAdminPage = function () {
            return $location.path().substring(0, 3) == '/a/';
        };
        $scope.isDevPage = !!window.is_dev;
    });
})();
