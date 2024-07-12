import { api } from "../../api"

import selectModalTemplate from "./select_modal.html?raw"
import textModalTemplate from "./text_modal.html?raw"

angular
  .module("billett.admin")
  .factory("AdminPrinter", ($http, $modal) => {
    return {
      getList: () => {
        return $http.get(api("printer"))
      },
      printSelectModal: (addHandler) => {
        return $modal.open({
          template: selectModalTemplate,
          controller: "AdminPrinterSelectController as ctrl",
          resolve: {
            addHandler: () => {
              return addHandler
            },
          },
        })
      },
      printTextModal: () => {
        return $modal.open({
          template: textModalTemplate,
          controller: "AdminPrinterTextController as ctrl",
        })
      },
      printTickets: (printername, ticketids) => {
        return $http.post(api("ticket/print/" + printername), {
          ids: ticketids,
        })
      },
      printTicket: (printername, ticketid) => {
        return $http.post(api("ticket/" + ticketid + "/print/" + printername))
      },
      printPreviewTicket: (printername, ticketgroupid) => {
        return $http.post(
          api(
            "ticketgroup/" +
              ticketgroupid +
              "/previewticket/print/" +
              printername,
          ),
        )
      },
      printText: (printername, text) => {
        return $http.post(api("printer/" + printername + "/text"), {
          text: text,
        })
      },
      setPreferred: (printer, forceEmpty) => {
        if (printer || forceEmpty) {
          sessionStorage["billett.printer.default"] = printer
            ? printer.name
            : null
        }
      },
      getPreferred: (list, override_name) => {
        var printer = null
        var last_name = sessionStorage["billett.printer.default"] || null

        list.forEach((row) => {
          if (row.name == override_name) {
            printer = row
          } else if (row.name == last_name && !printer) {
            printer = row
          }
        })

        return printer
      },
    }
  })
