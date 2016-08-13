angular.module('billett.admin').config(function ($stateProvider) {
    $stateProvider
        .state('admin-daytheme-new', {
            url: '/a/eventgroup/:eventgroup_id/new_daytheme',
            templateUrl: require('./edit.html'),
            controller: 'AdminDaythemeEditNewController',
            resolve: {auth: 'AuthRequireResolver'}
        })
        .state('admin-daytheme-edit', {
            url: '/a/daytheme/:id/edit',
            templateUrl: require('./edit.html'),
            controller: 'AdminDaythemeEditNewController',
            resolve: {auth: 'AuthRequireResolver'}
        })
        .state('admin-daytheme', {
            url: '/a/daytheme/:id',
            templateUrl: require('./index.html'),
            controller: 'AdminDaythemeController',
            resolve: {auth: 'AuthRequireResolver'}
        });
});


