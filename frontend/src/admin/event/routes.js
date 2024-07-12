import editTemplate from "./edit.html?raw"
import checkinTemplate from "./checkin.html?raw"
import template from "./index.html?raw"

angular.module("billett.admin").config(($stateProvider) => {
  $stateProvider
    .state("admin-event-new", {
      url: "/a/eventgroup/:eventgroup_id/new_event",
      template: editTemplate,
      controller: "AdminEventEditNewController",
      resolve: { auth: "AuthRequireResolver" },
    })
    .state("admin-event-edit", {
      url: "/a/event/:id/edit",
      template: editTemplate,
      controller: "AdminEventEditNewController",
      resolve: { auth: "AuthRequireResolver" },
    })
    .state("admin-event-checkin", {
      url: "/a/event/:id/checkin",
      template: checkinTemplate,
      controller: "AdminCheckinController as ctrl",
      resolve: { auth: "AuthRequireResolver" },
    })
    .state("admin-event", {
      url: "/a/event/:id",
      template,
      controller: "AdminEventController as ctrl",
      resolve: { auth: "AuthRequireResolver" },
    })
})
