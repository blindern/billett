const angular = require('angular');

module.exports = 'billett.admin';

(function() {
    var module = angular.module('billett.admin', [
        require('angular-file-upload'),
        require('../auth'),
        require('../common'),
        require('angular-resource'),
        require('ui.router'),
        require('ui.bootstrap.modal'),
        require('ui.bootstrap.typeahead'),
        require('ui.bootstrap.tpls'),
        require('ui.unique'),
        require('ng-sortable'),
        require('ng-focus-on'),
    ]);

    module.run(function ($modalStack, $rootScope) {
        // make sure modals close on state change
        $rootScope.$on('$stateChangeSuccess', function () {
            var topModal = $modalStack.getTop();
            while (topModal) {
                $modalStack.dismiss(topModal.key, '$locationChangeSuccess');
                topModal = $modalStack.getTop();
            }
        });
    });

    require('./daytheme/AdminDaythemeController');
    require('./daytheme/AdminDaythemeEditNewController');
    require('./daytheme/AdminDaythemeService');
    require('./daytheme/daytheme.scss');
    require('./daytheme/routes');

    require('./event/AdminCheckinController');
    require('./event/AdminEventController');
    require('./event/AdminEventEditNewController');
    require('./event/AdminEventService');
    require('./event/event.scss');
    require('./event/routes');

    require('./eventgroup/AdminEventgroupController');
    require('./eventgroup/AdminEventgroupEditNewController');
    require('./eventgroup/AdminEventgroupNewController');
    require('./eventgroup/AdminEventgroupService');
    require('./eventgroup/AdminEventgroupSoldTicketsStatsController');
    require('./eventgroup/eventgroup.scss');
    require('./eventgroup/routes');

    require('./index/AdminIndexController');

    require('./order/AdminOrderController');
    require('./order/AdminOrderEmailController');
    require('./order/AdminOrderListController');
    require('./order/AdminOrderNewController');
    require('./order/AdminOrderService');
    require('./order/new.scss');
    require('./order/order.scss');
    require('./order/routes');

    require('./payment/AdminPaymentAddController');
    require('./payment/AdminPayment');

    require('./paymentgroup/AdminPaymentgroupItemController');
    require('./paymentgroup/AdminPaymentgroupListController');
    require('./paymentgroup/AdminPaymentgroupNewController');
    require('./paymentgroup/AdminPaymentgroupSelectController');
    require('./paymentgroup/AdminPaymentgroupService');
    require('./paymentgroup/AdminPaymentsource');
    require('./paymentgroup/AdminPaymentsourceNewController');
    require('./paymentgroup/paymentgroup.scss');
    require('./paymentgroup/paymentgroup-select');
    require('./paymentgroup/routes');

    require('./printer/AdminPrinter');
    require('./printer/AdminPrinterSelectController');
    require('./printer/AdminPrinterTextController');
    require('./printer/printerList');

    require('./ticket/AdminTicket');
    require('./ticket/AdminTicketRevokeController');

    require('./ticketgroup/AdminTicketgroupAddToOrderController');
    require('./ticketgroup/AdminTicketgroupController');
    require('./ticketgroup/AdminTicketgroupNewController');
    require('./ticketgroup/AdminTicketgroupService');
    require('./ticketgroup/add_ticketgroup_to_order.scss');
    require('./ticketgroup/routes');

})();
