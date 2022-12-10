import { api } from "../../api"

var module = angular.module("billett.admin")

module.factory("AdminEvent", function ($resource, $http) {
  var r = $resource(
    api("event/:id"),
    {
      id: "@id",
      admin: 1,
    },
    {
      update: { method: "PUT" },
    },
  )

  r.prototype.setPublish = function (state) {
    return $http.patch(api("event/" + this.id), {
      is_published: state,
      admin: 1,
    })
  }

  r.prototype.setSelling = function (state) {
    return $http.patch(api("event/" + this.id), {
      is_selling: state,
      admin: 1,
    })
  }

  r.prototype.setTicketgroupsOrder = function (groups) {
    var opts = {
      admin: 1,
    }

    var i = 0
    groups.forEach(function (group) {
      opts[group.id] = i++
    })

    return $http.post(api("event/" + this.id + "/ticketgroups_order"), opts)
  }

  return r
})
