(function() {
    'use strict';

    var module = angular.module('billett.common.CsrfInceptorService', []);

    module.config(function($httpProvider) {
        $httpProvider.interceptors.push('CsrfInterceptor');
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
})();
