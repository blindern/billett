angular.module('billett.admin').config(function ($stateProvider) {
    $stateProvider
        .state('admin-daytheme-new', {
            url: '/a/eventgroup/:eventgroup_id/new_daytheme',
            templateProvider: ($q) => {
                return $q((resolve) => {
                    // lazy load the view
                    require.ensure([], () => resolve(require('!!html!./edit.html')));
                });
            },
            controller: 'AdminDaythemeEditNewController',
            resolve: {auth: 'AuthRequireResolver'}
        })
        .state('admin-daytheme-edit', {
            url: '/a/daytheme/:id/edit',
            templateProvider: ($q) => {
                return $q((resolve) => {
                    // lazy load the view
                    require.ensure([], () => resolve(require('!!html!./edit.html')));
                });
            },
            controller: 'AdminDaythemeEditNewController',
            resolve: {auth: 'AuthRequireResolver'}
        })
        .state('admin-daytheme', {
            url: '/a/daytheme/:id',
            templateProvider: ($q) => {
                return $q((resolve) => {
                    // lazy load the view
                    require.ensure([], () => resolve(require('!!html!./index.html')));
                });
            },
            controller: 'AdminDaythemeController',
            resolve: {auth: 'AuthRequireResolver'}
        });
});


