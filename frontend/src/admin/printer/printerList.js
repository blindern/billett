import template from "./select_box.html?raw"

angular
  .module("billett.admin")
  .directive("printerList", (AdminPrinter) => {
    return {
      restrict: "E",
      template,
      scope: {
        printer: "=",
        id: "@",
        canDisable: "=",
      },
      replace: true,
      link: (scope) => {
        scope.t = {}
        scope.Math = window.Math

        AdminPrinter.getList().then((response) => {
          scope.printers = response.data
          scope.printer = scope.t.printer = AdminPrinter.getPreferred(
            response.data,
            scope.printer ? scope.printer.name : null,
          )
        })

        scope.update = () => {
          scope.printer = scope.t.printer
          AdminPrinter.setPreferred(scope.printer, true)
        }
      },
    }
  })
