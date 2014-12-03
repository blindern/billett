'use strict';

angular.module('billett.admin.paymentgroup', [
    'ngRoute',
    'billett.auth',
    'billett.helper.page'
])

.config(function($routeProvider) {
    $routeProvider.when('/a/paymentgroup/:id', {
        templateUrl: 'views/admin/paymentgroup/index.html',
        controller: 'AdminPaymentgroupController',
        resolve: {auth: 'AuthRequireResolver'}
    });
})

.controller('AdminPaymentgroupController', function(Page, $routeParams) {
    // TODO
});
