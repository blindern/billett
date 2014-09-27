'use strict';

angular.module('billett.info', ['ngRoute', 'billett.helper.page'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/salgsbetingelser', {
		templateUrl: 'views/salgsbetingelser.html',
		controller: 'SalgsBetController'
	}).
	when('/om', {
		templateUrl: 'views/om.html',
		controller: 'OmController'
	}).
	when('/kontakt', {
		templateUrl: 'views/kontakt.html',
		controller: 'KontaktController'
	});
}])

.controller('SalgsBetController', function(Page, $http, $scope) {
	Page.setTitle('Salgsbetingelser');
})

.controller('OmController', function(Page, $http, $scope) {
	Page.setTitle('Om billettsystemet');
})

.controller('KontaktController', function(Page, $http, $scope) {
	Page.setTitle('Kontakt');
});