'use strict';

angular.module('billett.index', ['ngRoute', 'billett.helper.page'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/', {
		templateUrl: 'views/index.html',
		controller: 'IndexController'
	});
}])

.controller('IndexController', function(Page) {
	Page.setTitle('UKA på Blindern');
});