import {api} from '../api';
import AuthService from './AuthService';
const angular = require('angular');

module.exports = 'billett.auth';

(function() {
    'use strict';

    var module = angular.module('billett.auth', [
        'ui.router'
    ]);

    module.config(function($stateProvider) {
        $stateProvider.state('login', {
            url: '/login',
            template: 'Går til logg inn side',
            controller: function($location) {
                window.location.href = api('login?url=a');
            }
        }).
        state('logout', {
            url: '/logout',
            template: 'Logger ut',
            controller: function() {
                window.location.href = api('logout');
            }
        });
    });

    module.factory("AuthService", function($location, $q) {
        return AuthService;
    });

    module.factory("AuthRequireResolver", function($location, $q, AuthService) {
        return $q(function(resolve, reject) {
            AuthService.isLoggedIn().then(isLoggedIn => {
                if (isLoggedIn) {
                    AuthService.hasRole('billett.admin').then(hasRole => {
                        if (hasRole) {
                            resolve();
                        } else {
                            $location.path('/');
                            reject();
                        }
                    }, reject);
                } else {
                    window.location.href = 'login?url='+encodeURIComponent($location.path());
                }
            }, reject);
        });
    });
})();
