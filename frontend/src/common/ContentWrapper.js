import angular from "angular"

import template from "./content.html?raw"

let module = angular.module("billett.common")

module.directive("contentWrapper", () => {
  return {
    restrict: "A",
    template,
  }
})
