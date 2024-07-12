import { api } from "../../api"

var module = angular.module("billett.admin")

module.factory("AdminDaytheme", ($http, $resource) => {
  var r = $resource(
    api("daytheme/:id"),
    {
      id: "@id",
      admin: 1,
    },
    {
      update: { method: "PUT" },
    },
  )

  return r
})
