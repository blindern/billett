(function() {
    'use strict';

    var module = angular.module('billett.guest');

    module.config(function ($stateProvider) {
        $stateProvider.state('salgsbetingelser', {
            url: '/salgsbetingelser',
            templateProvider: ($q) => {
                  return $q((resolve) => {
                        // lazy load the view
                        require.ensure([], () => resolve(require('!!html!./salgsbetingelser.html')));
                  });
            },
            controller: 'SalgsBetController'
        });
    });

    module.controller('SalgsBetController', function (Page, $http, $scope) {
        Page.setTitle('Salgsbetingelser');
    });
})();
