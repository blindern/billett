var module = angular.module("billett.admin")

module.controller(
  "AdminTicketgroupNewController",
  (
    Page,
    $stateParams,
    AdminTicketgroup,
    AdminEvent,
    $scope,
    $location,
  ) => {
    $scope.event_id = $stateParams["id"]
    $scope.ticketgroup = {
      price: 0,
      is_normal: true,
    }

    var loader = Page.setLoading()
    AdminEvent.get(
      { id: $stateParams["id"] },
      (ret) => {
        loader()
        $scope.event = ret
      },
      () => {
        loader()
        Page.set404()
      },
    )

    $scope.addTicketgroup = () => {
      var g = new AdminTicketgroup($scope.ticketgroup)
      g.event_id = $scope.event_id
      g.$save(
        (res) => {
          $location.path("/a/event/" + g.event_id)
        },
        (err) => {
          alert(err.data)
        },
      )
    }
  },
)
