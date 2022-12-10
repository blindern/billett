import newTemplate from "./new.html?raw"
import template from "./index.html?raw"

angular.module("billett.admin").config(function ($stateProvider) {
  $stateProvider
    .state("admin-ticketgroup-new", {
      url: "/a/event/:id/ticketgroup/new",
      template: newTemplate,
      controller: "AdminTicketgroupNewController",
      resolve: { auth: "AuthRequireResolver" },
    })
    .state("admin-ticketgroup", {
      url: "/a/event/:event_id/ticketgroup/:ticketgroup_id",
      template,
      controller: "AdminTicketgroupController",
      resolve: { auth: "AuthRequireResolver" },
    })
})
