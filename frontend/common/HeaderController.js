(function() {
    'use strict';

    var module = angular.module('billett.common.HeaderController', []);

    // the menu
    module.controller('HeaderController', function ($scope, $location) {
        $scope.isActive = function (path, prefixpath) {
            if ($location.path() == path)
                return true;

            if (arguments.length > 1) {
                for (var i = 1; i < arguments.length; i++) {
                    var p = arguments[i];
                    if ($location.path().substring(0, p.length) == p)
                        return true;
                }
            }

            return false;
        };
    });
})();
