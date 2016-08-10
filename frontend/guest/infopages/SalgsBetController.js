(function() {
    'use strict';

    var module = angular.module('billett.guest');

    module.config(function ($stateProvider) {
        $stateProvider.state('salgsbetingelser', {
            url: '/salgsbetingelser',
            templateUrl: 'assets/views/guest/infopages/salgsbetingelser.html',
            controller: 'SalgsBetController'
        });
    });

    module.controller('SalgsBetController', function (Page, $http, $scope) {
        Page.setTitle('Salgsbetingelser');
    });
})();
