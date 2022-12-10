import paymentgroupSelectBoxTemplate from "./paymentgroup_select_box.html?raw"

angular
  .module("billett.admin")
  .directive("paymentgroupSelect", function (AdminPaymentgroup) {
    return {
      restrict: "E",
      template: paymentgroupSelectBoxTemplate,
      scope: {
        paymentgroup: "=",
        eventgroupId: "=",
        id: "@",
      },
      replace: true,
      link: function (scope) {
        var reload = function () {
          delete scope.paymentgroups
          AdminPaymentgroup.getValid(scope.eventgroupId).$promise.then(
            function (ret) {
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

        scope.new = function () {
          AdminPaymentgroup.newModal(scope.eventgroupId).result.then(function (
            paymentgroup,
          ) {
            scope.t.paymentgroup = paymentgroup
            scope.update()
            reload()
          })
        }

        scope.update = function () {
          scope.paymentgroup = scope.t.paymentgroup
          AdminPaymentgroup.setPreferredGroup(scope.paymentgroup)
        }
      },
    }
  })
