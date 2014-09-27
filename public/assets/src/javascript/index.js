'use strict';

angular.module('billett.index', ['ngRoute', 'billett.helper.page'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/', {
		templateUrl: 'views/index.html',
		controller: 'IndexController'
	});
}])

.controller('IndexController', function(Page, $http, $scope) {
	Page.setTitle('Kommende arrangementer');

	$http.get('api/events/get_upcoming').success(function(ret) {
		console.log("got data", ret);
		$scope.upcoming = ret;
	});
});