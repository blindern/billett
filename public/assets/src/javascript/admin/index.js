'use strict';

angular.module('billett.admin', [
	'ngRoute',
	'billett.helper.page',
    'billett.admin.event',
    'billett.admin.eventgroup',
    'billett.admin.order',
    'billett.admin.paymentgroup',
    'billett.admin.ticketgroup',
])

.config(function($routeProvider) {
	$routeProvider.when('/a', {
		templateUrl: 'views/admin/index.html',
		controller: 'AdminIndexController'
	});

}).

controller('AdminIndexController', function(Page, $http, $scope, AdminEventGroup) {
	Page.setTitle('Administration');

    AdminEventGroup.query(function(ret) {
        $scope.eventgroups = ret;
    });
});