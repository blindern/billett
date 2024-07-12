var module = angular.module("billett.admin")

module.controller(
  "AdminDaythemeController",
  (
    Page,
    $stateParams,
    $http,
    $scope,
    AdminDaytheme,
    AdminEvent,
    $location,
  ) => {
    Page.setTitle("Temadag")

    var loader = Page.setLoading()
    AdminDaytheme.get(
      { id: $stateParams["id"] },
      (ret) => {
        loader()

        $scope.daytheme = ret
      },
      () => {
        loader()
        Page.set404()
      },
    )
  },
)
