import { api } from "../../api"

import paymentgroupSelectTemplate from "./paymentgroup_select.html?raw"
import paymentsourceNewTemplate from "./paymentsource_new.html?raw"

angular
  .module("billett.admin")
  .factory("AdminPaymentsource", function ($http, $modal, $resource) {
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

    r.newModal = function (paymentgroup) {
      return $modal.open({
        template: paymentsourceNewTemplate,
        controller: "AdminPaymentsourceNewController as ctrl",
        resolve: {
          paymentgroup: function () {
            return paymentgroup
          },
        },
      })
    }

    r.selectModal = function (resolve) {
      return $modal.open({
        template: paymentgroupSelectTemplate,
        controller: "AdminPaymentgroupSelectController as ctrl",
        resolve: resolve,
      })
    }

    return r
  })
