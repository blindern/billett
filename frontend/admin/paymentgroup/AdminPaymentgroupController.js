(function() {
    'use strict';

    var module = angular.module('billett.admin.paymentgroup', [
        'ngRoute',
        'billett.auth',
        'billett.common.PageService'
    ]);

    module.config(function ($routeProvider) {
        $routeProvider.when('/a/paymentgroup/:id', {
            templateUrl: 'assets/views/admin/paymentgroup/index.html',
            controller: 'AdminPaymentgroupController',
            resolve: {auth: 'AuthRequireResolver'}
        });
    });

    module.controller('AdminPaymentgroupController', function (Page, $routeParams) {
        // TODO
    });
})();
