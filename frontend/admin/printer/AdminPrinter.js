import {api} from '../../api';

angular.module('billett.admin').factory('AdminPrinter', function ($http, $modal) {
    return {
        getList: function () {
            return $http.get(api('printer'));
        },
        printSelectModal: function (addHandler) {
            return $modal.open({
                templateUrl: require('./select_modal.html'),
                controller: 'AdminPrinterSelectController as ctrl',
                resolve: {
                    addHandler: function () {
                        return addHandler;
                    }
                }
            });
        },
        printTextModal: function () {
            return $modal.open({
                templateUrl: require('./text_modal.html'),
                controller: 'AdminPrinterTextController as ctrl'
            });
        },
        printTickets: function (printername, ticketids) {
            return $http.post(api('ticket/print/'+printername), {
                ids: ticketids
            });
        },
        printTicket: function (printername, ticketid) {
            return $http.post(api('ticket/'+ticketid+'/print/'+printername));
        },
        printPreviewTicket: function (printername, ticketgroupid) {
            return $http.post(api('ticketgroup/'+ticketgroupid+'/previewticket/print/'+printername));
        },
        printText: function (printername, text) {
            return $http.post(api('printer/'+printername+'/text'), {
                text: text
            });
        },
        setPreferred: function (printer, forceEmpty) {
            if (printer || forceEmpty) {
                sessionStorage['billett.printer.default'] = printer ? printer.name : null;
            }
        },
        getPreferred: function (list, override_name) {
            var printer = null;
            var last_name = sessionStorage['billett.printer.default'] || null;

            list.forEach(function (row) {
                if (row.name == override_name) {
                    printer = row;
                } else if (row.name == last_name && !printer) {
                    printer = row;
                }
            });

            return printer;
        }
    };
});
