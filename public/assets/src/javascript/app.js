'use strict';

var module = angular.module('billett', [
	'ngRoute',
	'billett.helper.page',
	'billett.index',
    'billett.admin',
    'billett.info',
    'billett.event'
]);

module.config(['$routeProvider', function($routeProvider) {
	$routeProvider.otherwise({redirectTo: '/'});
}]);

module.config(['$locationProvider', function($locationProvider) {
	// use HTML5 history API for nice urls
	$locationProvider.html5Mode(true);
}]);

// add 'auto-focus' as an attribute to a tag
// source: http://stackoverflow.com/a/20865048
module.directive('autoFocus', function($timeout) {
    return {
        restrict: 'AC',
        link: function(_scope, _element) {
            $timeout(function(){
                _element[0].focus();
            }, 0);
        }
    };
});