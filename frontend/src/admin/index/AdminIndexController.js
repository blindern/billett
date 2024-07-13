import template from "./index.html?raw"

var module = angular.module("billett.admin")

module.controller(
  "AdminIndexController",
  (Page, $http, $scope, AdminEventgroup, AdminPrinter) => {
    AdminEventgroup.query((ret) => {
      $scope.eventgroups = ret
    })

    $scope.printText = () => {
      AdminPrinter.printTextModal()
    }
  },
)
