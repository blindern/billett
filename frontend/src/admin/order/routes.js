import newTemplate from "./new.html?raw"
import orderTemplate from "./order.html?raw"
import template from "./index.html?raw"

angular.module("billett.admin").config(($stateProvider) => {
  $stateProvider
    .state("admin-order-new", {
      url: "/a/order/new/:id",
      template: newTemplate,
      controller: "AdminOrderNewController as ctrl",
      resolve: { auth: "AuthRequireResolver" },
      params: {
        paymentgroup_id: null,
      },
    })
    .state("admin-order", {
      url: "/a/order/:id",
      template: orderTemplate,
      controller: "AdminOrderController as ctrl",
      resolve: { auth: "AuthRequireResolver" },
    })
    .state("admin-orders", {
      url: "/a/orders?eventgroup_id",
      template,
      controller: "AdminOrderListController",
      resolve: { auth: "AuthRequireResolver" },
      reloadOnSearch: false,
    })
})
