import { api } from "../../api"

var module = angular.module("billett.admin")

module.factory("AdminTicketgroup", ($resource) => {
  var r = $resource(
    api("ticketgroup/:id"),
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
