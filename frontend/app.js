(function() {
    'use strict';

    moment.locale('nb');

    var module = angular.module('billett', [
        'ui.router',
        'angular-google-analytics',
        'billett.auth',
        'billett.common',
        'billett.admin',
        'billett.guest'
    ]);

    module.config(function ($locationProvider, $stateProvider, $urlRouterProvider, AnalyticsProvider) {
        $stateProvider.state('404', {
            templateUrl: 'assets/views/guest/infopages/404.html'
        });

        $urlRouterProvider.otherwise(function ($injector, $location) {
            console.log("404 found");
            $injector.invoke(['$state', function ($state) {
                $state.go('404');
            }]);
        });

        // use HTML5 history API for nice urls
        $locationProvider.html5Mode(true);

        AnalyticsProvider.setAccount('UA-19030223-1');
        AnalyticsProvider.trackPages(false);
        AnalyticsProvider.trackPrefix('billett');
        AnalyticsProvider.useAnalytics(true);
        AnalyticsProvider.useECommerce(true, false);
    });

    module.run(function ($rootScope, $timeout, Analytics, Page) {
        $rootScope.$on('$stateChangeSuccess', function () {
            // let it finish page setup
            $timeout(function() {
                var loaded = function() {
                    // let the digest run so all states are updated
                    $timeout(function() {
                        console.log("tracking page view");
                        Analytics.trackPage();
                    }, 0);
                };
                var p = Page.getPageLoaderPromise();
                if (p) p.then(loaded);
                else loaded();
            }, 0);
        });
    });
})();
