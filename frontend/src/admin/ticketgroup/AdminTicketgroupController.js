var module = angular.module("billett.admin")

module.controller(
  "AdminTicketgroupController",
  (Page, $stateParams, AdminTicketgroup, $scope, $location) => {
    Page.setTitle("Billettgruppe")

    $scope.event_id = $stateParams["event_id"]
    $scope.ticketgroup_id = $stateParams["ticketgroup_id"]

    var loader = Page.setLoading()
    AdminTicketgroup.get(
      { id: $scope.ticketgroup_id },
      (ret) => {
        loader()
        if (ret.event.id != $scope.event_id) {
          $location.path("/a")
          return
        }

        ret.use_web = !!ret.use_web
        ret.use_office = !!ret.use_office
        ret.is_normal = !!ret.is_normal

        $scope.ticketgroup = ret
      },
      (err) => {
        loader()
        Page.set404()
      },
    )

    $scope.updateTicketgroup = () => {
      $scope.ticketgroup.$update((ret) => {
        $location.path("/a/event/" + $scope.event_id)
      })
    }

    $scope.deleteTicketgroup = () => {
      // TODO: no delete on valid/reserved tickets
      AdminTicketgroup.delete({ id: $scope.ticketgroup_id }, (res) => {
        $location.path("/a/event/" + $scope.event_id)
      })
    }
  },
)
