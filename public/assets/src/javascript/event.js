'use strict';

var mod = angular.module('billett.event', ['ngRoute', 'billett.helper.page'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/event/:id', {
		templateUrl: 'views/event/index.html',
		controller: 'EventController'
	});
}])

.controller('EventController', function(Page, $http, $scope, $location, $routeParams) {
	Page.setTitle('Arrangement');

	$http.get('api/event/'+encodeURIComponent($routeParams['id'])).success(function(ret) {
		// do we have an alias not being used?
		if (ret.alias != null && $routeParams['id'] != ret.alias) {
			$location.path('/event/'+ret.alias);
			return;
		}

		Page.setTitle(ret.title);
		$scope.event = ret;

		// TODO: the server should process this
		// if the event has started/is finished
		$scope.event_expired = false;

		// TODO: the server should process this
		// if the time limit for ticket sales is reached
		$scope.event_timeout = false;

		// FIXME: remove this debug line
		$scope.event.is_selling = 1;
	});

	// buy form submit
	$scope.proceed = function() {
		var count = 0;
		var groups = {};

		angular.forEach($scope.event.ticketgroups, function(g) {
			var c = parseInt(g.order_count);
			if (c <= 0) return;

			count += c;
			groups[g.id] = c;
		});

		if (count == 0) {
			alert("Du må velge noen billetter.");
			return;
		}

		// create reservation
		$http.post('/api/event/'+$scope.event.id+'/createreservation', {
			'ticketgroups': groups
		}).success(function(ret) {
			$scope.reservation = ret;
		});
	};

	// place order submit
	$scope.placeorder = function() {
		// save fields
		$http.patch('/api/order/'+$scope.reservation.id, {
			'name': $scope.reservation.name,
			'email': $scope.reservation.email,
			'phone': $scope.reservation.phone
		}).success(function() {
			// TODO: place order
			console.log("TODO: place order");
		});
	};

	// abort order
	$scope.abortorder = function() {
		$http.delete('/api/order/'+$scope.reservation.id).success(function() {
			$scope.reservation = null;
		});
	};
});

mod.filter('range', function() {
	return function(count) {
		count = parseInt(count)
		var ret = [];
		for (var i = 0; i < count; i++) ret.push(i);
		return ret;
	}
});