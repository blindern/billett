(function() {
    'use strict';

    var module = angular.module('billett.admin');

    module.factory('AdminOrder', function ($http, $modal, $resource) {
        var r = $resource('api/order/:id', {
            'id': '@id',
            'admin': 1,
            limit: 20
        }, {
            query: {
                isArray: false
            },
            get: {
                params: {
                    // TODO: this only works for query, not get
                    'with': 'tickets.ticketgroup,tickets.event,payments.paymentgroup,eventgroup'
                }
            },
            update: {method: 'PUT'}
        });

        r.prototype.sendEmail = function (email) {
            var params = {};
            if (email) params.email = email;
            return $http.post('api/order/'+this.id+'/email', params);
        };

        r.addTicketsModal = function (resolve) {
            return $modal.open({
                templateUrl: 'assets/views/admin/ticketgroup/add_ticketgroup_to_order.html',
                controller: 'AdminTicketgroupAddToOrderController as ctrl',
                resolve: resolve
            });
        };

        return r;
    });
})();
