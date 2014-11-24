'use strict';

angular.module('billett.admin.paymentgroup', [
    'ngRoute',
    'billett.helper.page'
])

.config(function($routeProvider) {
    $routeProvider.when('/a/paymentgroup/:id', {
        templateUrl: 'views/admin/paymentgroup/index.html',
        controller: 'AdminPaymentgroupController'
    });
})

.controller('AdminPaymentgroupController', function(Page, $routeParams) {
    // TODO
});
