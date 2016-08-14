import {api} from '../../api';

angular.module('billett.admin').factory('AdminPaymentsource', function ($http, $modal, $resource) {
    var r = $resource(api('paymentsource/:id'), {
        id: '@id'
    }, {
        update: {
            method: 'PUT'
        }
    });

    r.newModal = function (paymentgroup) {
        return $modal.open({
            template: require('./paymentsource_new.html'),
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
            template: require('./paymentgroup_select.html'),
            controller: 'AdminPaymentgroupSelectController as ctrl',
            resolve: resolve
        });
    };

    return r;
});
