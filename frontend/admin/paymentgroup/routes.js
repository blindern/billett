angular.module('billett.admin').config(function ($stateProvider) {
    $stateProvider
        .state('admin-paymentgroup', {
            url: '/a/paymentgroup/:id',
            templateProvider: ($q) => {
                return $q((resolve) => {
                    // lazy load the view
                    require.ensure([], () => resolve(require('!!html!./item.html')));
                });
            },
            controller: 'AdminPaymentgroupItemController as ctrl',
            resolve: {auth: 'AuthRequireResolver'}
        })
        .state('admin-paymentgroups', {
            url: '/a/eventgroup/:eventgroup_id/paymentgroups',
            templateProvider: ($q) => {
                return $q((resolve) => {
                    // lazy load the view
                    require.ensure([], () => resolve(require('!!html!./list.html')));
                });
            },
            controller: 'AdminPaymentgroupListController as ctrl',
            resolve: {auth: 'AuthRequireResolver'}
        });
});
