import editTemplate from "./edit.html?raw"
import template from "./index.html?raw"
import soldTicketsStateTemplate from "./sold_tickets_stats.html?raw"

angular.module("billett.admin").config(function ($stateProvider) {
  $stateProvider
    .state("admin-eventgroup-new", {
      url: "/a/eventgroup/new",
      template: editTemplate,
      controller: "AdminEventgroupEditNewController",
      resolve: { auth: "AuthRequireResolver" },
    })
    .state("admin-eventgroup-edit", {
      url: "/a/eventgroup/:id/edit",
      template: editTemplate,
      controller: "AdminEventgroupEditNewController",
      resolve: { auth: "AuthRequireResolver" },
    })
    .state("admin-eventgroup", {
      url: "/a/eventgroup/:id",
      template,
      controller: "AdminEventgroupController",
      resolve: { auth: "AuthRequireResolver" },
    })
    .state("admin-sold-tickets-stats", {
      url: "/a/eventgroup/:id/sold_tickets_stats",
      template: soldTicketsStateTemplate,
      controller: "AdminEventgroupSoldTicketsStatsController as ctrl",
      resolve: { auth: "AuthRequireResolver" },
    })
})
