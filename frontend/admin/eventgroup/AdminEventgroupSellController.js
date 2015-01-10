angular.module('billett.admin').controller('AdminEventgroupSellController', function ($http, $location, $q, $scope, $stateParams, Page, AdminEventgroup) {
    var ctrl = this;
    Page.setTitle('Selg billetter');

    var loader = Page.setLoading();
    $q.all([
        AdminEventgroup.get({id: $stateParams['id']}).$promise,
        $http.get('api/paymentgroup?filter=eventgroup_id='+parseInt($stateParams['id'])+',time_end=0')
    ]).then(function (res) {
        loader();
        ctrl.eventgroup = res[0];
        ctrl.paymentgroups = res[1].data;

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
        var id = null;
        if ($stateParams['paymentgroup_id']) id = $stateParams['paymentgroup_id'];
        else if (typeof(Storage) !== 'undefined' && sessionStorage.lastPaymentgroup) id = sessionStorage.lastPaymentgroup;

        if (id) {
            ctrl.paymentgroups.forEach(function (g) {
                if (g.id == id) {
                    ctrl.active_paymentgroup = g;
                    ctrl.changePaymentgroup();
                }
            });
        }
    };

    ctrl.changePaymentgroup = function () {
        if (typeof(Storage) !== 'undefined') {
            sessionStorage.lastPaymentgroup = ctrl.active_paymentgroup.id;
        }
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
