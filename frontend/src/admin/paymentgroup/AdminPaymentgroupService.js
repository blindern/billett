import { api } from "../../api"

import newTemplate from "./new.html?raw"
import paymentgroupSelectTemplate from "./paymentgroup_select.html?raw"

angular
  .module("billett.admin")
  .factory("AdminPaymentgroup", ($http, $modal, $resource) => {
    r.setPreferredGroup = (group) => {
      if (group) {
        sessionStorage.lastPaymentgroup = group.id
      }
    }

    r.getPreferredGroup = (grouplist, override_id) => {
      var group = null
      var last_id = sessionStorage.lastPaymentgroup
        ? sessionStorage.lastPaymentgroup
        : null

      grouplist.forEach((row) => {
        if (row.id == override_id) {
          group = row
        } else if (row.id == last_id && !group) {
          group = row
        }
      })

      return group
    }

    r.newModal = (eventgroupId) => {
      return $modal.open({
        template: newTemplate,
        controller: "AdminPaymentgroupNewController as ctrl",
        resolve: {
          eventgroupId: () => {
            return eventgroupId
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
