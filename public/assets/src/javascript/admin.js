'use strict';

angular.module('billett.admin', ['ngRoute', 'billett.helper.page'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/a', {
		templateUrl: 'views/admin/index.html',
		controller: 'AdminIndexController'
	}).
	when('/a/:id', {
		templateUrl: 'views/admin/eventgroup.html',
		controller: 'AdminEventGroupIndexController'
	}).
	when('/a/:eventgroupid/checkin', {
		templateUrl: 'views/admin/eventgroup.html',
		controller: 'AdminCheckinController'
	}).
	when('/a/:eventgroupid/checkin/:eventid', {
		templateUrl: 'views/admin/eventgroup.html',
		controller: 'AdminCheckinController'
	});
}]).

controller('AdminIndexController', function(Page) {
	Page.setTitle('Administration');

}).

controller('AdminEventGroupIndexController', function(Page, $routeParams) {
	Page.setTitle('Administration');

}).

controller('AdminCheckinController', function(Page, $routeParams) {
	Page.setTitle('Administration');
});