var module = angular.module('billett.admin');

module.controller('AdminDaythemeController', function (Page, $stateParams, $http, $scope, AdminDaytheme, AdminEvent, $location) {
    Page.setTitle('Temadag');

    var loader = Page.setLoading();
    AdminDaytheme.get({id: $stateParams['id']}, function (ret) {
        loader();

        $scope.daytheme = ret;

    }, function () {
        loader();
        Page.set404();
    });
});
