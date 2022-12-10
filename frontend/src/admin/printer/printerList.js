import template from "./select_box.html?raw"

angular
  .module("billett.admin")
  .directive("printerList", function (AdminPrinter) {
    return {
      restrict: "E",
      template,
      scope: {
        printer: "=",
        id: "@",
        canDisable: "=",
      },
      replace: true,
      link: function (scope) {
        scope.t = {}
        scope.Math = window.Math

        AdminPrinter.getList().then(function (response) {
          scope.printers = response.data
          scope.printer = scope.t.printer = AdminPrinter.getPreferred(
            response.data,
            scope.printer ? scope.printer.name : null,
          )
        })

        scope.update = function () {
          scope.printer = scope.t.printer
          AdminPrinter.setPreferred(scope.printer, true)
        }
      },
    }
  })
