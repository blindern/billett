angular.module('billett.admin').factory('AdminPaymentsource', function ($http, $modal, $resource) {
    var r = $resource('api/paymentsource/:id', {
        id: '@id'
    }, {
        update: {
            method: 'PUT'
        }
    });

    r.newModal = function (paymentgroup) {
        return $modal.open({
            templateUrl: 'assets/views/admin/paymentgroup/paymentsource_new.html',
            controller: 'AdminPaymentsourceNewController as ctrl',
            resolve: {
                paymentgroup: function () {
                    return paymentgroup;
                }
            }
        });
    };

    r.selectModal = function (resolve) {
        return $modal.open({
            templateUrl: 'assets/views/admin/paymentgroup/paymentgroup_select.html',
            controller: 'AdminPaymentgroupSelectController as ctrl',
            resolve: resolve
        });
    };

    return r;
});
