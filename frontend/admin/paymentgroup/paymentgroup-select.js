angular.module('billett.admin').directive('paymentgroupSelect', function(AdminPaymentgroup) {
    return {
        restrict: 'E',
        templateUrl: 'assets/views/admin/paymentgroup/paymentgroup_select_box.html',
        scope: {
            paymentgroup: '=',
            eventgroupId: '=',
            id: '@'
        },
        replace: true,
        link: function(scope) {
            var reload = function () {
                delete scope.paymentgroups;
                AdminPaymentgroup.getValid(scope.eventgroupId).$promise.then(function (ret) {
                    scope.paymentgroups = ret;
                    scope.paymentgroup = AdminPaymentgroup.getPreferredGroup(ret, scope.paymentgroup ? scope.paymentgroup.id : null);
                });
            };

            reload();

            scope.new = function () {
                AdminPaymentgroup.newModal(scope.eventgroupId).result.then(function (paymentgroup) {
                    scope.paymentgroup = paymentgroup;
                    scope.update();
                    reload();
                })
            };

            scope.update = function () {
                AdminPaymentgroup.setPreferredGroup(scope.paymentgroup);
            };
        }
    };
})