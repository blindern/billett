import {api} from '../../api';

(function() {
    'use strict';

    var module = angular.module('billett.guest');

    module.config(function ($stateProvider) {
        $stateProvider.state('index', {
            url: '/',
            templateUrl: require('./index.html'),
            controller: 'IndexController'
        });
    });

    module.controller('IndexController', function (AuthService, Page, $http, $scope) {
        Page.setTitle('Arrangementer');

        $scope.has_role_admin = AuthService.hasRole('billett.admin');

        $http.get(api('event/get_upcoming')).success(function (ret) {
            $scope.upcoming = ret;
        });

        $http.get(api('eventgroup')).success(function (ret) {
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
