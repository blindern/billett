'use strict';

var mod = angular.module('billett.event', ['ngRoute', 'billett.helper.page'])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/event/:id', {
		templateUrl: 'views/event/index.html',
		controller: 'EventController'
	});
}])

.controller('EventController', function(Page, EventReservation, $http, $scope, $location, $routeParams) {
	Page.setTitle('Arrangement');

	$http.get('api/event/'+encodeURIComponent($routeParams['id'])+'?simple=1').success(function(ret) {
		// do we have an alias not being used?
		if (ret.alias != null && $routeParams['id'] != ret.alias) {
			$location.path('/event/'+ret.alias);
			return;
		}

		Page.setTitle(ret.title);
		$scope.event = ret;
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
		// attach it to root scope so it will be available if user switch page
		$http.post('/api/event/'+$scope.event.id+'/createreservation', {
			'ticketgroups': groups
		}).success(function(ret) {
			$scope.reservation = ret;
			EventReservation.setReservation(ret);
		}).error(function(ret) {
			alert("Ukjent feil oppsto.");
		});
	};

	// check for reservation
	EventReservation.restoreReservation(function() {
		$scope.reservation = EventReservation.data;
	});

	// place order submit
	$scope.placeOrder = function() {
		// save fields
		$http.patch('/api/order/'+$scope.reservation.id, {
			'name': $scope.reservation.name,
			'email': $scope.reservation.email,
			'phone': $scope.reservation.phone
		}).success(function() {
			$http.post('/api/order/'+$scope.reservation.id+'/place').success(function(ret) {
				$scope.checkout = ret;
			}).error(function(ret) {
				alert("Ukjent feil oppsto: "+ret);
			});
		}).error(function(ret) {
			if (ret == "data validation failed") alert("Ugyldig verdi i skjemaet!");
			else alert("Ukjent feil oppsto: "+ret);
		});
	};

	// abort order
	$scope.abortOrder = function() {
		EventReservation.abortReservation().success(function() {
			$scope.reservation = null;
		});
	};
});

mod.service('EventReservation', function($http) {
	this.data = null; // the reservation

	var deleteReservation = function() {
		this.data = null;
		sessionStorage.removeItem('pendingReservation');
	};

	this.setReservation = function(reservation) {
		this.data = reservation;
		if (typeof(Storage) !== 'undefined') {
			sessionStorage.pendingReservation = JSON.stringify(reservation);
		}
	};

	this.restoreReservation = function(callback) {
		if (typeof(Storage) !== 'undefined' && sessionStorage.pendingReservation) {
			var res = JSON.parse(sessionStorage.pendingReservation);
			var self = this;

			// check if still valid
			$http.get('/api/order/'+res.id).success(function(ret) {
				// TODO: check if valid reservation
				self.data = ret;
				callback();
			}).error(function() {
				deleteReservation();
			});
		}
	};

	this.getEvent = function() {
		if (!this.data) return null;
		return this.data.tickets[0].event;
	};

	this.abortReservation = function() {
		return $http.delete('/api/order/'+this.data.id).success(function() {
			deleteReservation();
		});
	};



})

mod.filter('range', function() {
	return function(count) {
		count = parseInt(count)
		var ret = [];
		for (var i = 0; i < count; i++) ret.push(i);
		return ret;
	}
});