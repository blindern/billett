(function() {
    'use strict';

    var module = angular.module('billett.guest');

    module.config(function ($stateProvider) {
        $stateProvider.state('hjelp', {
            url: '/hjelp',
            templateProvider: ($q) => {
                  return $q((resolve) => {
                        // lazy load the view
                        require.ensure([], () => resolve(require('!!html!./hjelp.html')));
                  });
            },
            controller: 'HjelpController'
        });
    });

    module.controller('HjelpController', function (Page, $http, $scope) {
        Page.setTitle('Hjelp');
    });
})();
