import template from "./index.html?raw"

var module = angular.module("billett.admin")

module.config(function ($stateProvider) {
  $stateProvider.state("admin-index", {
    url: "/a",
    template,
    controller: "AdminIndexController",
    resolve: { auth: "AuthRequireResolver" },
  })
})

module.controller(
  "AdminIndexController",
  function (Page, $http, $scope, AdminEventgroup, AdminPrinter) {
    AdminEventgroup.query(function (ret) {
      $scope.eventgroups = ret
    })

    $scope.printText = function () {
      AdminPrinter.printTextModal()
    }
  },
)
