var module = angular.module("billett.admin")

//module.controller('AdminEventgroupEditNewController', (Page, $stateParams) => {
module.controller(
  "AdminEventgroupEditNewController",
  (
    Page,
    AdminEventgroup,
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
      Page.setTitle("Ny arrangementgruppe")
      loader()
    } else {
      Page.setTitle("Rediger arrangementgruppe")
      //loader();

      AdminEventgroup.get(
        { id: $stateParams["id"] },
        (ret) => {
          loader()

          $scope.eventgroup = ret
        },
        () => {
          loader()
          Page.set404()
        },
      )
    }

    $scope.storeEventgroup = () => {
      if (is_new) {
        if (!$scope.eventgroup.title) return

        var eg = new AdminEventgroup($scope.eventgroup)

        eg.$save(
          (res) => {
            $location.path("/a/eventgroup/" + res.id)
          },
          (err) => {
            alert(err.data)
          },
        )
      } else {
        $scope.eventgroup.$update(
          (res) => {
            // go to previous page or redirect to eventgroup admin page
            var timer = $timeout(() => {
              $location.path("/a/eventgroup/" + res.id)
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
