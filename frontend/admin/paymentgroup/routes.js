angular.module('billett.admin').config(function ($stateProvider) {
    $stateProvider
        .state('admin-paymentgroup', {
            url: '/a/paymentgroup/:id',
            templateUrl: require('./item.html'),
            controller: 'AdminPaymentgroupItemController as ctrl',
            resolve: {auth: 'AuthRequireResolver'}
        })
        .state('admin-paymentgroups', {
            url: '/a/eventgroup/:eventgroup_id/paymentgroups',
            templateUrl: require('./list.html'),
            controller: 'AdminPaymentgroupListController as ctrl',
            resolve: {auth: 'AuthRequireResolver'}
        });
});
