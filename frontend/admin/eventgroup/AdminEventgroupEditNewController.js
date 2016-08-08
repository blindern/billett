(function() {
    'use strict';

    var module = angular.module('billett.admin');

    //module.controller('AdminEventgroupEditNewController', function (Page, $stateParams){
    module.controller('AdminEventgroupEditNewController', function (Page, AdminEventgroup, $stateParams, $rootScope, $scope, $location, $window, $timeout) {
        var is_new = $scope.is_new = !('id' in $stateParams);

        var loader = Page.setLoading();

        if (is_new) {
            Page.setTitle('Ny arrangementgruppe');
            loader();
        }
        else {
            Page.setTitle('Rediger arrangementgruppe');
			loader();
        }

        $scope.storeEventgroup = function () {

            if (is_new) {

                if (!($scope.eventgroup.title)) return;

                var eg = new AdminEventgroup($scope.eventgroup);

                console.log(eg);

                eg.$save(function (res) {
                    $location.path('/a/eventgroup/' + res.id);
                }, function (err) {
                    alert(err.data);
                });
            } else {
                $scope.group.$update(function (res) {
                    // go to previous page or redirect to eventgroup admin page
                    var timer = $timeout(function () {
                        $location.path('/a/eventgroup/' + res.id);
                    }, 100);
                    var ev = $rootScope.$on('$routeChangeStart', function (event, next, current) {
                        ev();
                        $timeout.cancel(timer);
                    });
                    $window.history.back();
                }, function (err) {
                    alert(err.data);
                });
            }
        };
    });
})();

