(function() {

'use strict';

var module = angular.module('billett.auth', ['ngRoute']);

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

    return {
        isLoggedIn: function() {
            return logged_in;
        },

        getUser: function() {
            return user;
        },

        requireUser: function() {
            if (!logged_in) {
                window.location.href = 'login';
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