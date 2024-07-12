import itemTemplate from "./item.html?raw"
import listTemplate from "./list.html?raw"

angular.module("billett.admin").config(($stateProvider) => {
  $stateProvider
    .state("admin-paymentgroup", {
      url: "/a/paymentgroup/:id",
      template: itemTemplate,
      controller: "AdminPaymentgroupItemController as ctrl",
      resolve: { auth: "AuthRequireResolver" },
    })
    .state("admin-paymentgroups", {
      url: "/a/eventgroup/:eventgroup_id/paymentgroups",
      template: listTemplate,
      controller: "AdminPaymentgroupListController as ctrl",
      resolve: { auth: "AuthRequireResolver" },
    })
})
