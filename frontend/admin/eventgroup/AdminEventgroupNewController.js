(function() {
    'use strict';

    var module = angular.module('billett.admin');

    module.config(function ($routeProvider) {
        $routeProvider.when('/a/eventgroup/new', {
            templateUrl: 'assets/views/admin/eventgroup/new.html',
            controller: 'AdminEventgroupNewController',
            resolve: {auth: 'AuthRequireResolver'}
        });
    });

    module.controller('AdminEventgroupNewController', function (Page, $routeParams) {
        Page.setTitle('Ny arrangementgruppe');
    });
})();
