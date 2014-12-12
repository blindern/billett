(function() {
    'use strict';

    var module = angular.module('billett.common.PageService', [
        'ngAnimate',
        'ngToast'
    ]);

    module.factory('Page', function ($rootScope, ngToast) {
        var activeLoader;
        $rootScope.$on('$routeChangeStart', function () {
            $rootScope.loading = false;
        });

        $rootScope.title = 'default';
        return {
            title: function () {
                return $rootScope.title;
            },
            setTitle: function (newTitle) {
                $rootScope.title = newTitle;
            },

            toast: function (text, params) {
                var params = params || {};
                angular.extend(params, {
                    content: text
                });
                ngToast.create(params);
            },

            setLoading: function () {
                var thisLoader = activeLoader = function () {
                    if (thisLoader == activeLoader) {
                        console.log("correct loader");
                        $rootScope.loading = false;
                    } else {
                        console.log("incorrect loader");
                    }
                };
                $rootScope.loading = true;

                return thisLoader;
            }
        };
    });
})();
