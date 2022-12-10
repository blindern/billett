var module = angular.module("billett.common")

// global page
module.controller(
  "PageController",
  function (AuthService, Page, $scope, $location, $rootScope) {
    $scope.isAdminPage = function () {
      return $location.path().substring(0, 3) == "/a/"
    }

    $scope.isDevPage =
      $scope.isDibsTest =
      $scope.isLoggedIn =
      $scope.loggedInButNoAccess =
        false
    AuthService.isDevPage().then((res) => {
      if (res) $scope.isDevPage = true
    })
    AuthService.isDibsTest().then((res) => {
      if (res) $scope.isDibsTest = true
    })
    AuthService.isLoggedIn().then((res) => {
      if (res) $scope.isLoggedIn = true
      if (res) {
        AuthService.hasRole("billett.admin").then((hasRole) => {
          if (!hasRole) {
            $scope.loggedInButNoAccess = true
          }
        })
      }
    })
    $scope.username = $scope.realname = ""
    AuthService.getUser().then((user) => {
      if (user) {
        $scope.username = user.username
        $scope.realname = user.realname
      }
    })

    $rootScope.$on("$routeChangeStart", function () {
      Page.setDefault("url", $location.absUrl())
    })

    $rootScope.domainUrl = $location.protocol() + "://" + $location.host()
  },
)
