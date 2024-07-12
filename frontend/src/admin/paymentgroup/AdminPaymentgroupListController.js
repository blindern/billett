angular
  .module("billett.admin")
  .controller(
    "AdminPaymentgroupListController",
    ($stateParams, AdminEventgroup, AdminPaymentgroup, Page) => {
      var ctrl = this

      var loadPaymentgroups = () => {
        var loader = Page.setLoading()
        AdminEventgroup.get(
          { id: $stateParams["eventgroup_id"] },
          (ret) => {
            ctrl.eventgroup = ret

            AdminPaymentgroup.query(
              {
                filter: "eventgroup_id=" + ret.id,
                order: "time_end:NOTNULL,-time_end,-time_start",
              },
              (groups) => {
                loader()

                ctrl.paymentgroups = groups
              },
            )
          },
        )
      }

      ctrl.new = () => {
        AdminPaymentgroup.newModal(ctrl.eventgroup.id).result.then(() => {
          loadPaymentgroups()
        })
      }

      loadPaymentgroups()
    },
  )
