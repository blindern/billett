angular.module('billett.admin').controller('AdminPaymentgroupItemController', function ($stateParams, AdminPaymentgroup, Page) {
    var ctrl = this;

    var loader = Page.setLoading();
    AdminPaymentgroup.get({id: $stateParams['id']}, function (ret) {
        loader();

        ctrl.paymentgroup = ret;
    });

    ctrl.startEdit = function () {
        ctrl.edit = {
            'title': ctrl.paymentgroup.title,
            'description': ctrl.paymentgroup.description
        };
    };

    ctrl.abortEdit = function () {
        delete ctrl.edit;
    };

    ctrl.save = function () {
        ctrl.paymentgroup.title = ctrl.edit.title;
        ctrl.paymentgroup.description = ctrl.edit.description;
        ctrl.paymentgroup.$update(function (ret) {
            ctrl.paymentgroup = ret;
            delete ctrl.edit;
        });
    };

    ctrl.close = function () {
        if (!ctrl.paymentgroup.time_end && confirm("Er du sikker på at du vil lukke betalingsgruppen? Dette gjøres kun ved oppgjør av økonomi.")) {
            ctrl.paymentgroup.close().success(function (ret) {
                ctrl.paymentgroup = ret;
            });
        }
    }
});
