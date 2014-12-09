'use strict';

angular.module('billett.info', ['ngRoute', 'billett.helper.page'])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/salgsbetingelser', {
        templateUrl: 'views/salgsbetingelser.html',
        controller: 'SalgsBetController'
    }).
    when('/hjelp', {
        templateUrl: 'views/hjelp.html',
        controller: 'HjelpController'
    });
}])

.controller('SalgsBetController', function(Page, $http, $scope) {
    Page.setTitle('Salgsbetingelser');
})

.controller('HjelpController', function(Page, $http, $scope) {
    Page.setTitle('Hjelp');
});
