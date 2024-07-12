var module = angular.module("billett.common")

// global page
module.controller(
  "PageController",
  function (AuthService, Page, $scope, $location, $rootScope) {
    $rootScope.$on("$routeChangeStart", function () {
      Page.setDefault("url", $location.absUrl())
    })

    $rootScope.domainUrl = $location.protocol() + "://" + $location.host()
  },
)
