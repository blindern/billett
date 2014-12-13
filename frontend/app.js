(function() {
    'use strict';

    moment.locale('nb');

    var module = angular.module('billett', [
        'ngRoute',
        'angular-google-analytics',
        'billett.auth',

        // common
        'billett.common.directives',
        'billett.common.filters',
        'billett.common.CsrfInceptorService',
        'billett.common.HeaderController',
        'billett.common.PageController',
        'billett.common.PageService',
        'billett.common.ResponseDataService',

        // admin
        'billett.admin.event',
        'billett.admin.eventgroup',
        'billett.admin.index',
        'billett.admin.order',
        'billett.admin.paymentgroup',
        'billett.admin.ticketgroup',

        // guest
        'billett.event',
        'billett.eventgroup',
        'billett.index',
        'billett.infopages.HjelpController',
        'billett.infopages.SalgsBetController',
        'billett.order'
    ]);

    module.config(function ($locationProvider, $routeProvider, AnalyticsProvider) {
        $routeProvider.otherwise({templateUrl: 'assets/views/guest/infopages/404.html'});

        // use HTML5 history API for nice urls
        $locationProvider.html5Mode(true);

        AnalyticsProvider.setAccount('UA-19030223-1');
        AnalyticsProvider.trackPrefix('billett');
        AnalyticsProvider.useAnalytics(true);
        AnalyticsProvider.useECommerce(true, false);
    });

    module.run(function ($rootScope, $timeout, Analytics, Page) {
        $rootScope.$on('$routeChangeSuccess', function () {
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
