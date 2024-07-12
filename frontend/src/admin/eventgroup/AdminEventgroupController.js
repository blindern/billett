import moment from "moment"

var module = angular.module("billett.admin")

module.controller(
  "AdminEventgroupController",
  function (
    Page,
    $stateParams,
    $http,
    $scope,
    AdminEventgroup,
    AdminEvent,
    $location,
  ) {
    Page.setTitle("Arrangementgruppe")

    var loader = Page.setLoading()
    AdminEventgroup.get(
      { id: $stateParams["id"] },
      function (ret) {
        loader()

        $scope.group = ret
        $scope.applyFilter()

        $scope.categories = []
        for (const event of $scope.group.events) {
          if ($scope.categories.indexOf(event.category || "") != -1) continue
          $scope.categories.push(event.category || "")
        }
        $scope.categories.sort()
      },
      function () {
        loader()
        Page.set404()
      },
    )

    $scope.filter_sale = ""
    $scope.filter_category = "-1"
    $scope.filter_hidden = "0"
    $scope.applyFilter = function () {
      var r = {}
      for (const item of $scope.group.events) {
        if (
          $scope.filter_sale !== "" &&
          $scope.filter_sale != !!item.ticketgroups.length
        )
          continue
        if (
          $scope.filter_category !== "-1" &&
          $scope.filter_category != (item.category || "")
        )
          continue
        if (
          $scope.filter_hidden != "" &&
          $scope.filter_hidden != item.is_admin_hidden
        )
          continue

        var k = moment.unix(item.time_start - 3600 * 6).format("YYYY-MM-DD")
        r[k] = r[k] || []
        r[k].push(item)
      }

      $scope.days = r
    }

    $scope.eventTogglePublish = function (event) {
      new AdminEvent(event)
        .setPublish(!event.is_published)
        .then(function (response) {
          const ret = response.data
          event.is_published = ret.is_published
        })
    }

    $scope.eventToggleSelling = function (event) {
      new AdminEvent(event)
        .setSelling(!event.is_selling)
        .then(function (response) {
          const ret = response.data
          event.is_selling = ret.is_selling
        })
    }
  },
)
