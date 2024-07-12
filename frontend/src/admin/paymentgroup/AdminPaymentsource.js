import { api } from "../../api"

import paymentgroupSelectTemplate from "./paymentgroup_select.html?raw"
import paymentsourceNewTemplate from "./paymentsource_new.html?raw"

angular
  .module("billett.admin")
  .factory("AdminPaymentsource", ($http, $modal, $resource) => {
    var r = $resource(
      api("paymentsource/:id"),
      {
        id: "@id",
      },
      {
        update: {
          method: "PUT",
        },
      },
    )

    r.newModal = (paymentgroup) => {
      return $modal.open({
        template: paymentsourceNewTemplate,
        controller: "AdminPaymentsourceNewController as ctrl",
        resolve: {
          paymentgroup: () => {
            return paymentgroup
          },
        },
      })
    }

    r.selectModal = (resolve) => {
      return $modal.open({
        template: paymentgroupSelectTemplate,
        controller: "AdminPaymentgroupSelectController as ctrl",
        resolve: resolve,
      })
    }

    return r
  })
