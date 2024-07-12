import paymentgroupSelectBoxTemplate from "./paymentgroup_select_box.html?raw"

angular
  .module("billett.admin")
  .directive("paymentgroupSelect", (AdminPaymentgroup) => {
    return {
      restrict: "E",
      template: paymentgroupSelectBoxTemplate,
      scope: {
        paymentgroup: "=",
        eventgroupId: "=",
        id: "@",
      },
      replace: true,
      link: (scope) => {
        var reload = () => {
          delete scope.paymentgroups
          AdminPaymentgroup.getValid(scope.eventgroupId).$promise.then(
            (ret) => {
              scope.paymentgroups = ret
              scope.paymentgroup = scope.t.paymentgroup =
                AdminPaymentgroup.getPreferredGroup(
                  ret,
                  scope.paymentgroup ? scope.paymentgroup.id : null,
                )
            },
          )
        }

        reload()
        scope.t = {}

        scope.new = () => {
          AdminPaymentgroup.newModal(scope.eventgroupId).result.then(
            (paymentgroup) => {
              scope.t.paymentgroup = paymentgroup
              scope.update()
              reload()
            },
          )
        }

        scope.update = () => {
          scope.paymentgroup = scope.t.paymentgroup
          AdminPaymentgroup.setPreferredGroup(scope.paymentgroup)
        }
      },
    }
  })
