angular
  .module("billett.admin")
  .controller(
    "AdminPaymentgroupListController",
    function ($stateParams, AdminEventgroup, AdminPaymentgroup, Page) {
      var ctrl = this

      var loadPaymentgroups = function () {
        var loader = Page.setLoading()
        AdminEventgroup.get(
          { id: $stateParams["eventgroup_id"] },
          function (ret) {
            ctrl.eventgroup = ret

            AdminPaymentgroup.query(
              {
                filter: "eventgroup_id=" + ret.id,
                order: "time_end:NOTNULL,-time_end,-time_start",
              },
              function (groups) {
                loader()

                ctrl.paymentgroups = groups
              },
            )
          },
        )
      }

      ctrl.new = function () {
        AdminPaymentgroup.newModal(ctrl.eventgroup.id).result.then(function () {
          loadPaymentgroups()
        })
      }

      loadPaymentgroups()
    },
  )
