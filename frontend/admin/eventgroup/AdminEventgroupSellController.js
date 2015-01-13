angular.module('billett.admin').controller('AdminEventgroupSellController', function ($http, $location, $q, $scope, $stateParams, Page, AdminEventgroup, AdminPaymentgroup) {
    var ctrl = this;
    Page.setTitle('Selg billetter');

    var loader = Page.setLoading();
    $q.all([
        AdminEventgroup.get({id: $stateParams['id']}).$promise,
        AdminPaymentgroup.getValid(parseInt($stateParams['id'])).$promise
    ]).then(function (res) {
        loader();
        ctrl.eventgroup = res[0];
        ctrl.paymentgroups = res[1];

        loadLastPaymentgroup();
        generateEventList();
    }, function () {
        $location.path('a');
    });

    var generateEventList = function () {
        if (!ctrl.eventgroup) return;

        // build list of ticketgroups
        ctrl.events = ctrl.eventgroup.events.filter(function (event) {
            if (event.is_old && !ctrl.ticketfilter.show_old) return false;
            return event.is_selling && event.ticketgroups.length > 0;
        });
    };

    var loadLastPaymentgroup = function () {
        var group = AdminPaymentgroup.getPreferredGroup(ctrl.paymentgroups, $stateParams['paymentgroup_id']);
        if (group) {
            ctrl.active_paymentgroup = group;
            ctrl.changePaymentgroup();
        }
    };

    ctrl.changePaymentgroup = function () {
        AdminPaymentgroup.setPreferredGroup(ctrl.active_paymentgroup);
    };

    ctrl.ticketfilter = {};
    $scope.$watchCollection('ctrl.ticketfilter', function () {
        generateEventList();
    });

    ctrl.ticketgroup_check = function(actual, expected) {
        if (expected) return true;
        return actual;
    };
});
