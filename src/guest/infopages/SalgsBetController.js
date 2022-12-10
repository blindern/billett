import template from "./salgsbetingelser.html?raw"

var module = angular.module("billett.guest")

module.config(function ($stateProvider) {
  $stateProvider.state("salgsbetingelser", {
    url: "/salgsbetingelser",
    template,
    controller: "SalgsBetController",
  })
})

module.controller("SalgsBetController", function (Page, $http, $scope) {
  Page.setTitle("Salgsbetingelser")
})
