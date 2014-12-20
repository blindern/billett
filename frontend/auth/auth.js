(function() {
    'use strict';

    var module = angular.module('billett.auth');

    module.config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/login', {
            template: 'Går til logg inn side',
            controller: function() {
                window.location.href = 'login';
            }
        }).
        when('/logout', {
            template: 'Logger ut',
            controller: function() {
                window.location.href = 'logout';
            }
        });
    }]);

    module.run(function($rootScope, AuthService) {
        // create a global binding that can be used by templates
        $rootScope.AuthService = AuthService;
    });

    module.factory("AuthService", function($location) {
        var logged_in = window.logged_in;
        var user = window.user;
        var roles = window.user_roles;

        return {
            isLoggedIn: function() {
                return logged_in;
            },

            hasRole: function(role) {
                return roles.indexOf('all') != -1;
                // FIXME
                //return roles.indexOf(role) != -1;
            },

            getUser: function() {
                return user;
            },

            requireUser: function() {
                if (!logged_in) {
                    window.location.href = 'login';
                    return false;
                }
                if (!this.hasRole('billett.admin')) {
                    $location.path('/');
                    return false;
                }
                return true;
            }
        };
    });

    module.factory("AuthRequireResolver", function($q, AuthService) {
        return $q(function(resolve, reject) {
            if (AuthService.requireUser()) {
                resolve();
            } else {
                reject();
            }
        });
    });
})();
