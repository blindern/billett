import { evaluate } from "mathjs";

angular.module('billett.admin').controller('AdminPaymentsourceNewController', function ($modalInstance, $scope, paymentgroup, AdminPaymentsource, Page) {
    var ctrl = this;

    ctrl.paymentsource = new AdminPaymentsource;
    ctrl.paymentsource.paymentgroup_id = paymentgroup.id;
    ctrl.paymentgroup = paymentgroup;

    ctrl.paymentsource.amount = 0;
    ctrl.other = '';
    ctrl.othervalue = 0;

    ctrl.cashitems = [
        1,
        5,
        10,
        20,
        50,
        100,
        200,
        500,
        1000
    ];
    ctrl.cashinputs = {};
    ctrl.cashvalues = {};

    ctrl.titles = getDefaultTitles();

    $scope.$watch('ctrl.paymentsource.type', function (val) {
        if (val == 'cash') {
            setCashTitle();
        }
        parseInputs();
    });

    $scope.$watch('ctrl.other', parseInputs);
    $scope.$watchCollection('ctrl.cashinputs', parseInputs);

    ctrl.complete = function () {
        if (!isInputOk()) {
            return;
        }

        updateDataField();

        ctrl.sending = true;
        ctrl.paymentsource.$save(function (paymentsource) {
            Page.toast('Registrering vellykket', {class: 'success'});
            $modalInstance.close(paymentsource);
        }, function (ret) {
            ctrl.sending = false;
            alert(ret);
        });
    };

    ctrl.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    function getDefaultTitles() {
        var list = [];
        (paymentgroup.eventgroup.paymentsources_data['sources'] || []).forEach(function (obj) {
            list.push(obj.title);
        });
        return list;
    }

    function setCashTitle() {
        ctrl.paymentsource.title = paymentgroup.eventgroup.paymentsources_data['cash_prefix'] || '';
    }

    function parseInputs() {
        ctrl.othervalue = ctrl.other === '' ? 0 : evaluate(ctrl.other.replace(",", "."));
        ctrl.paymentsource.amount = ctrl.othervalue || 0;

        if (ctrl.paymentsource.type == 'cash') {
            ctrl.cashvalues = {};
            angular.forEach(ctrl.cashinputs, function (val, key) {
                if (val === '') return;
                try {
                    ctrl.cashvalues[key] = evaluate(val.replace(",", "."));
                } catch (e) {
                    ctrl.cashvalues[key] = NaN;
                }
                ctrl.paymentsource.amount += ctrl.cashvalues[key] * key;
            });
        }

        ctrl.paymentsource.amount *= ctrl.multiply;
    }

    function isInputOk() {
        if (isNaN(ctrl.othervalue)) {
            Page.toast('Feltet for '+(ctrl.paymentsource.type == 'cash' ? 'annet ' : '')+'beløp er feil utfylt', {class: 'danger'});
            return false;
        }
        if (ctrl.othervalue < 0) {
            errorNeg();
            return false;
        }

        if (ctrl.paymentsource.type == 'cash') {
            var s = Math.abs(ctrl.othervalue);
            angular.forEach(ctrl.cashvalues, function (val, key) {
                if (isNaN(val)) {
                    Page.toast('Feltet for valør ' + key + ' er feil utfylt', {class: 'danger'});
                    return false;
                }
                if (val < 0) {
                    errorNeg();
                    return false;
                }
                s += Math.abs(val);
            });

            if (s == 0) {
                Page.toast('Du kan ikke registrere en tom opptelling', {class: 'danger'});
                return false;
            }
        }

        return true;

        function errorNeg() {
            Page.toast('Du kan ikke registrere en negativ telling', {class: 'danger'});
        }
    }

    function updateDataField() {
        if (ctrl.paymentsource.type != 'cash') return;

        ctrl.paymentsource.data = {};
        angular.forEach(ctrl.cashvalues, function (val, key) {
            if (val == 0) return;
            ctrl.paymentsource.data[key] = val * ctrl.multiply;
        });

        if (ctrl.othervalue != 0) ctrl.paymentsource.data['other'] = ctrl.othervalue * ctrl.multiply;
    }
});
