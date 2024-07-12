import moment from "moment"

var module = angular.module("billett.admin")

module.controller(
  "AdminEventEditNewController",
  (
    Page,
    AdminEventgroup,
    $stateParams,
    $rootScope,
    $scope,
    AdminEvent,
    $location,
    $window,
    $timeout,
  ) => {
    var is_new = ($scope.is_new = !("id" in $stateParams))

    var loader = Page.setLoading()
    if (is_new) {
      Page.setTitle("Nytt arrangement")
      $scope.eventgroup_id = $stateParams["eventgroup_id"]
      $scope.event = {
        max_sales: 0,
        max_each_person: 10,
      }

      AdminEventgroup.get(
        { id: $stateParams["eventgroup_id"] },
        (ret) => {
          $scope.group = ret
          loader()
        },
        () => {
          loader()
          Page.set404()
        },
      )
    } else {
      Page.setTitle("Rediger arrangement")

      AdminEvent.get(
        { id: $stateParams["id"] },
        (ret) => {
          loader()
          $scope.event = ret
          $scope.group = ret.eventgroup

          var parseTime = (t) => {
            if (!t) return
            return moment.unix(t).format("DD.MM.YYYY HH:mm")
          }

          $scope.time_start_text = parseTime($scope.event.time_start)
          $scope.time_end_text = parseTime($scope.event.time_end)
        },
        () => {
          loader()
          Page.set404()
        },
      )
    }

    $scope.updateTime = (which) => {
      var x = moment(
        $scope[which == "start" ? "time_start_text" : "time_end_text"],
        "DD.MM.YYYY HH:mm",
      ).unix()
      if (x < 0) x = 0
      $scope.event[which == "start" ? "time_start" : "time_end"] = x
    }

    $scope.storeEvent = () => {
      if (isNaN($scope.event.time_start)) return

      if (is_new) {
        var e = new AdminEvent($scope.event)
        e.eventgroup_id = $scope.eventgroup_id
        e.$save(
          (res) => {
            $location.path("/a/event/" + res.id)
          },
          (err) => {
            alert(err.data)
          },
        )
      } else {
        $scope.event.$update(
          (res) => {
            // go to previous page or redirect to event admin page
            var timer = $timeout(() => {
              $location.path("/a/event/" + res.id)
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
