import AuthService from './auth/AuthService';

(function() {
    'use strict';

    require('./app.scss');

    const angular = require('angular');
    require('bootstrap-sass');

    moment.locale('nb');

    let module = angular.module('billett', [
        require('ui.router'),
        require('angular-google-analytics'),
        require('./auth'),
        require('./common'),
        require('./admin'),
        require('./guest'),
    ]);

    module.config(function ($locationProvider, $httpProvider, $stateProvider, $urlRouterProvider, AnalyticsProvider, ngToastProvider) {
        $stateProvider.state('404', {
            template: require('./guest/infopages/404.html'),
        });

        $urlRouterProvider.otherwise(function ($injector, $location) {
            console.log("404 found");
            $injector.invoke(['$state', function ($state) {
                $state.go('404');
            }]);
        });

        // use HTML5 history API for nice urls
        $locationProvider.html5Mode(true);

        $httpProvider.defaults.withCredentials = true;

        AnalyticsProvider.setAccount('UA-19030223-1');
        AnalyticsProvider.trackPages(false);
        AnalyticsProvider.trackPrefix('billett');
        AnalyticsProvider.useAnalytics(true);
        AnalyticsProvider.useECommerce(true, false);

        ngToastProvider.configure({
            horizontalPosition: 'center'
        });
    });

    module.run(function ($rootScope, $timeout, Analytics, Page) {
        $rootScope.$on('$stateChangeSuccess', function () {
            // let it finish page setup
            $timeout(function() {
                var loaded = function() {
                    // let the digest run so all states are updated
                    $timeout(function() {
                        AuthService.isDevPage().then(isDevPage => {
                            if (!isDevPage) {
                                console.log("tracking page view");
                                Analytics.trackPage();
                            }
                        });
                    }, 0);
                };
                var p = Page.getPageLoaderPromise();
                if (p) p.then(loaded);
                else loaded();
            }, 0);
        });

        // iframe state
        $rootScope.isInIframe = window.top != window.self;
    });
})();
