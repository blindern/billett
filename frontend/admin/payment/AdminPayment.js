angular.module('billett.admin').factory('AdminPayment', function ($modal) {
    return {
        newModal: function (order) {
            return $modal.open({
                template: require('./payment_add.html'),
                controller: 'AdminPaymentAddController as ctrl',
                resolve: {
                    order: function () {
                        return order
                    }
                }
            });
        }
    };
});
