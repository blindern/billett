'use strict';

angular.module('billett.index', ['ngRoute', 'billett.helper.page'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/', {
		templateUrl: 'views/index.html',
		controller: 'IndexController'
	});
}])

.controller('IndexController', function(Page, $http, $scope) {
	Page.setTitle('Arrangementer');

	$http.get('api/event/get_upcoming').success(function(ret) {
		$scope.upcoming = ret;
	});

	$http.get('api/eventgroup').success(function(ret) {
		$scope.eventgroups = ret;
	});
});