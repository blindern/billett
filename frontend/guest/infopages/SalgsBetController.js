(function() {
    'use strict';

    var module = angular.module('billett.infopages.SalgsBetController', [
        'ngRoute',
        'billett.common.PageService'
    ]);

    module.config(function ($routeProvider) {
        $routeProvider.when('/salgsbetingelser', {
            templateUrl: 'assets/views/guest/infopages/salgsbetingelser.html',
            controller: 'SalgsBetController'
        });
    });

    module.controller('SalgsBetController', function (Page, $http, $scope) {
        Page.setTitle('Salgsbetingelser');
    });
})();
