angular.module('billett.admin').controller('AdminPrinterSelectController', function ($modalInstance, AdminPrinter, Page, addHandler) {
    var ctrl = this;

    ctrl.complete = function () {
        ctrl.sending = true;
        addHandler(ctrl.printer.name).then(function () {
            $modalInstance.close();
        }, function () {
            delete ctrl.sending;
        });
    };

    ctrl.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});
