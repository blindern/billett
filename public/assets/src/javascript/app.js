'use strict';

moment.locale('nb');

var module = angular.module('billett', [
	'ngRoute',
	'billett.helper.page',
	'billett.index',
    'billett.admin',
    'billett.info',
    'billett.event',
    'billett.eventgroup'
]);

module.config(['$routeProvider', function($routeProvider) {
	$routeProvider.otherwise({redirectTo: '/'});
}]);

module.config(['$locationProvider', function($locationProvider) {
	// use HTML5 history API for nice urls
	$locationProvider.html5Mode(true);
}]);

module.filter('formatdate', function() {
    return function(datetime, format) {
        return moment.unix(datetime).format(format);
    };
});

module.filter('price', function() {
    return function(amount, decimals) {
        var formatNumber = function(number, decimals)
        {
            number = number.toFixed(decimals) + '';
            x = number.split('.');
            x1 = x[0];
            x2 = x.length > 1 ? ',' + x[1] : '';
            var rgx = /(\d+)(\d{3})/;
            while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + ' ' + '$2');
            }
            return x1 + x2;
        }

        if (typeof(decimals) != "number") decimals = 0;
        return 'kr ' + formatNumber(parseFloat(amount), decimals);
    };
});

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