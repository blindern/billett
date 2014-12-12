(function() {
    'use strict';

    moment.locale('nb');

    var module = angular.module('billett', [
        'ngRoute',
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

    module.config(function ($locationProvider, $routeProvider) {
        $routeProvider.otherwise({templateUrl: 'infopages/404.html'});

        // use HTML5 history API for nice urls
        $locationProvider.html5Mode(true);
    });
})();
