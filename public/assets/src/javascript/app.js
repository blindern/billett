'use strict';

moment.locale('nb');

var module = angular.module('billett', [
    'ngRoute',
    'billett.auth',
    'billett.helper.page',
    'billett.index',
    'billett.admin',
    'billett.info',
    'billett.event',
    'billett.eventgroup',
    'billett.order'
]);

module.config(['$routeProvider', function($routeProvider) {
    $routeProvider.otherwise({templateUrl: 'views/404.html'});
}]);

module.config(['$locationProvider', '$httpProvider', function($locationProvider, $httpProvider) {
    // use HTML5 history API for nice urls
    $locationProvider.html5Mode(true);

    $httpProvider.interceptors.push('CsrfInterceptor');
}]);

module.filter('formatdate', function() {
    return function(datetime, format) {
        return moment.unix(datetime).format(format);
    };
});

module.filter('price', function() {
    return function(amount, decimals, in_nok) {
        if (typeof decimals == 'boolean') {
            in_nok = decimals;
            decimals = 0;
        }

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
        return (in_nok ? 'NOK ' : 'kr ') + formatNumber(parseFloat(amount), decimals);
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
            }, 100);
        }
    };
});

// add tags to head
module.directive('viewHead', function() {
    return {
        restrict: 'A',
        link: function (scope, element) {
            //element.removeAttr('view-head');
            angular.element('head').append(element);
            scope.$on('$destroy', function () {
                element.remove();
            });
        }
    };
});

module.service('ResponseData', function() {
    this.get = function(name) {
        if (window.response_data && name in window.response_data) {
            return window.response_data[name];
        }
    };
    this.set = function(name, value) {
        if (!window.response_data) window.response_data = {};
        window.response_data[name] = value;
    };
});

module.factory('CsrfInterceptor', function() {
    return {
        'request': function(config) {
            // don't add csrf token to other domains
            if (config.url.indexOf("//") == -1) {
                config.headers['X-Csrf-Token'] = $('meta[name=csrf-token]').attr('content');
            }
            return config;
        }
    }
});
