(function() {
    'use strict';

    var module = angular.module('billett.infopages.HjelpController', [
        'ngRoute',
        'billett.common.PageService'
    ]);

    module.config(function ($routeProvider) {
        $routeProvider.when('/hjelp', {
            templateUrl: 'assets/views/guest/infopages/hjelp.html',
            controller: 'HjelpController'
        });
    });

    module.controller('HjelpController', function (Page, $http, $scope) {
        Page.setTitle('Hjelp');
    });
})();
