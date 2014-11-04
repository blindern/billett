'use strict';

var mod = angular.module('billett.helper.page', ['ngAnimate']);

mod.factory('Page', function($rootScope) {
	$rootScope.title = 'default';
	return {
		title: function() { return $rootScope.title; },
		setTitle: function(newTitle) { $rootScope.title = newTitle; }
	};
});

// the menu
mod.controller('HeaderController', function($scope, $location) {
	$scope.isActive = function(path, prefixpath) {
		if ($location.path() == path)
			return true;

		if (arguments.length > 1) {
			for (var i = 1; i < arguments.length; i++) {
				var p = arguments[i];
				if ($location.path().substring(0, p.length) == p)
					return true;
			}
		}

		return false;
	};
});

// helper directive to mark a form input with has-error class
// usage: <div form-input-check="form-name,input-name">
mod.directive('formInputCheck', function() {
	return {
		restrict: 'A',
		link: function(_scope, _element, _attrs) {
			var t = _attrs['formInputCheck'].split(","),
				form = _scope[t[0]], input = _scope[t[0]][t[1]];

			function recheck() {
				if (input.$invalid && (input.$dirty || form.$submitted))
					_element.addClass('has-error');
				else
					_element.removeClass('has-error');
			}

			_scope.$watch(form.$name+'.'+input.$name+'.$invalid', recheck);
			_scope.$watch(form.$name+'.$submitted', recheck);
		}
	};
});