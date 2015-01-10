(function() {
    'use strict';

    var module = angular.module('billett.guest');

    module.config(function ($stateProvider) {
        $stateProvider.state('hjelp', {
            url: '/hjelp',
            templateUrl: 'assets/views/guest/infopages/hjelp.html',
            controller: 'HjelpController'
        });
    });

    module.controller('HjelpController', function (Page, $http, $scope) {
        Page.setTitle('Hjelp');
    });
})();
