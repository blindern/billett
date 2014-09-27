'use strict';

angular.module('billett.event', ['ngRoute', 'billett.helper.page'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/event/:id', {
		templateUrl: 'views/event/index.html',
		controller: 'EventController'
	});
}])

.controller('EventController', function(Page, $http, $scope, $routeParams) {
	Page.setTitle('Arrangement');

	$http.get('api/event/'+encodeURIComponent($routeParams['id'])).success(function(ret) {
		Page.setTitle(ret.title);
		console.log("got data", ret);
		$scope.data = ret;
	});
});