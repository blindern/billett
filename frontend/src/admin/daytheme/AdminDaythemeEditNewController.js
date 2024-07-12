var module = angular.module("billett.admin")

module.controller(
  "AdminDaythemeEditNewController",
  (
    Page,
    AdminDaytheme,
    $stateParams,
    $rootScope,
    $scope,
    $location,
    $window,
    $timeout,
  ) => {
    var is_new = ($scope.is_new = !("id" in $stateParams))

    var loader = Page.setLoading()

    if (is_new) {
      Page.setTitle("Ny temadag")
      $scope.eventgroup_id = $stateParams["eventgroup_id"]
      loader()
    } else {
      Page.setTitle("Rediger temadag")
      //loader();

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
    }

    $scope.storeDaytheme = () => {
      if (!$scope.daytheme.title || !$scope.daytheme.date) return

      $scope.daytheme.date = moment($scope.daytheme.date, "YYYY-MM-DD").unix()

      if (is_new) {
        $scope.daytheme.eventgroup_id = $scope.eventgroup_id

        var eg = new AdminDaytheme($scope.daytheme)

        eg.$save(
          (res) => {
            $location.path("/a/eventgroup/" + res.eventgroup_id)
          },
          (err) => {
            alert(err.data)
          },
        )
      } else {
        $scope.daytheme.$update(
          (res) => {
            // go to previous page or redirect to daytheme admin page
            var timer = $timeout(() => {
              $location.path("/a/eventgroup/" + res.eventgroup_id)
            }, 100)
            var ev = $rootScope.$on(
              "$routeChangeStart",
              (event, next, current) => {
                ev()
                $timeout.cancel(timer)
              },
            )
            $window.history.back()
          },
          (err) => {
            alert(err.data)
          },
        )
      }
    }
  },
)
