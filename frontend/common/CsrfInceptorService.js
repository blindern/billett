import {backendUrl} from '../api';

var module = angular.module('billett.common');

module.config(function($httpProvider) {
    $httpProvider.interceptors.push('CsrfInterceptor');
});

module.factory('CsrfInterceptor', function(AuthService) {
    return {
        'request': function(config) {
            // only add csrf-token to api-endpoint, but not /api/me
            if (config.url.substring(0, backendUrl.length) === backendUrl && config.url.indexOf('api/me') === -1) {
                return new Promise((resolve, reject) => {
                    AuthService.getCsrfToken().then(csrfToken => {
                        config.headers['X-Csrf-Token'] = csrfToken;
                        resolve(config);
                    }, reject);
                });
            }

            return config;
        }
    }
});
