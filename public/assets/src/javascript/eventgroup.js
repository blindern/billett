'use strict';

angular.module('billett.eventgroup', ['ngRoute', 'billett.helper.page'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/eventgroup/:id', {
		templateUrl: 'views/eventgroup/index.html',
		controller: 'EventGroupController'
	});
}])

.controller('EventGroupController', function(Page, $http, $scope, $routeParams) {
	Page.setTitle('Arrangementgruppe');

	$http.get('api/eventgroup/'+encodeURIComponent($routeParams['id'])).success(function(ret) {
		Page.setTitle(ret.title);
		console.log("got eventgroup data", ret);
		$scope.group = ret;
	});
});