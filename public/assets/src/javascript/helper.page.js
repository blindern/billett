'use strict';

angular.module('billett.helper.page', ['ngAnimate']).
factory('Page', function($rootScope) {
	$rootScope.title = 'default';
	return {
		title: function() { return $rootScope.title; },
		setTitle: function(newTitle) { $rootScope.title = newTitle; }
	};
}).

// the menu
controller('HeaderController', function($scope, $location) {
	$scope.isActive = function(path, prefixpath) {
		if ($location.path() == path)
			return true;

		if (prefixpath && $location.path().substring(0, prefixpath.length) == prefixpath)
			return true;

		return false;
	};
});