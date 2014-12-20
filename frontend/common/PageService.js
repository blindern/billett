(function() {
    'use strict';

    var module = angular.module('billett.common');

    module.factory('Page', function ($rootScope, $q, ngToast) {
        var activeLoader;
        $rootScope.$on('$routeChangeStart', function () {
            $rootScope.loading = false;
        });

        var attrs = {};
        $rootScope.meta = {};

        // set the current property to last on stack
        var setActive = function (name) {
            if (attrs[name].length == 0) {
                delete $rootScope.meta[name];
            } else {
                $rootScope.meta[name] = attrs[name].slice(-1)[0].val;
            }
        };

        return {
            /**
             * Return page title
             * @deprecated (use get method)
             */
            title: function () {
                return this.get('title');
            },

            /**
             * Set page title
             * @deprecated (use set method)
             */
            setTitle: function (newTitle) {
                this.set('title', newTitle);
            },

            /**
             * Set page property, optionally connected to scope so it will be removed when scope is destroyed
             *
             * Call the return value to remove it manually
             */
            set: function (name, value, bind_scope) {
                var x = {'val': value};

                if (!attrs[name]) attrs[name] = [];
                attrs[name].push(x);
                setActive(name);

                var removeMe = function () {
                    for (var i = 0; i < attrs[name].length; i++) {
                        if (attrs[name][i] == x) {
                            attrs[name].splice(i, 1);
                            setActive(name);
                            break;
                        }
                    }
                };

                if (bind_scope) {
                    bind_scope.$on('$destroy', removeMe);
                }

                return removeMe;
            },

            /**
             * Set default page property which will be used if no other property is set
             */
            setDefault: function (name, value) {
                if (!(name in attrs)) attrs[name] = [];
                if (attrs[name].length == 0 || !(attrs[name][0].isDefault||null)) {
                    attrs[name].unshift({val: value, isDefault: true});
                } else {
                    attrs[name][0].val = value;
                }
                setActive(name);
            },

            /**
             * Get page property
             */
            get: function (name) {
                if ($rootScope.meta[name]) {
                    return $rootScope.meta[name];
                }
            },

            /**
             * Add page toast
             */
            toast: function (text, params) {
                params = params || {};
                angular.extend(params, {
                    content: text
                });
                ngToast.create(params);
            },

            /**
             * Set page as loading and return function to call when loading completes
             */
            setLoading: function () {
                var thisLoader = activeLoader = $q.defer();

                $rootScope.loading = true;
                return function () {
                    if (thisLoader == activeLoader) {
                        console.log("correct loader");
                        thisLoader.resolve();
                        activeLoader = null;
                        $rootScope.loading = false;
                    } else {
                        console.log("incorrect loader");
                        thisLoader.reject();
                    }
                };
            },

            /**
             * Get loader promise if it exists
             */
            getPageLoaderPromise: function () {
                if (activeLoader) {
                    return activeLoader.promise;
                }
            },

            /**
             * Set current page as 404
             *
             * Used on matched routes where the controller don't find it's resources
             */
            set404: function () {
                $rootScope.page404 = true;
                var title = this.set('title', '404 Page not found');
                var ev = $rootScope.$on('$routeChangeStart', function () {
                    $rootScope.page404 = false;
                    title(); // remove title from stack
                    ev(); // delete this event
                });
            }
        };
    });
})();
