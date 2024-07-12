import editTemplate from "./edit.html?raw"
import template from "./index.html?raw"

angular.module("billett.admin").config(($stateProvider) => {
  $stateProvider
    .state("admin-daytheme-new", {
      url: "/a/eventgroup/:eventgroup_id/new_daytheme",
      template: editTemplate,
      controller: "AdminDaythemeEditNewController",
      resolve: { auth: "AuthRequireResolver" },
    })
    .state("admin-daytheme-edit", {
      url: "/a/daytheme/:id/edit",
      template: editTemplate,
      controller: "AdminDaythemeEditNewController",
      resolve: { auth: "AuthRequireResolver" },
    })
    .state("admin-daytheme", {
      url: "/a/daytheme/:id",
      template,
      controller: "AdminDaythemeController",
      resolve: { auth: "AuthRequireResolver" },
    })
})
