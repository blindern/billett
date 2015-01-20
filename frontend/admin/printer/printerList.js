angular.module('billett.admin').directive('printerList', function(AdminPrinter) {
    return {
        restrict: 'E',
        templateUrl: 'assets/views/admin/printer/select_box.html',
        scope: {
            printer: '=',
            id: '@',
            canDisable: '='
        },
        replace: true,
        link: function(scope) {
            scope.t = {};
            scope.Math = window.Math;

            AdminPrinter.getList().success(function (ret) {
                scope.printers = ret;
                scope.printer = scope.t.printer = AdminPrinter.getPreferred(ret, scope.printer ? scope.printer.name : null);
            });

            scope.update = function () {
                scope.printer = scope.t.printer;
                AdminPrinter.setPreferred(scope.printer, true);
            };
        }
    };
});
