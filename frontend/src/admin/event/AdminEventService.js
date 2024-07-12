import { api } from "../../api"

var module = angular.module("billett.admin")

module.factory("AdminEvent", ($resource, $http) => {
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

  r.prototype.setPublish = (state) => {
    return $http.patch(api("event/" + this.id), {
      is_published: state,
      admin: 1,
    })
  }

  r.prototype.setSelling = (state) => {
    return $http.patch(api("event/" + this.id), {
      is_selling: state,
      admin: 1,
    })
  }

  r.prototype.setTicketgroupsOrder = (groups) => {
    var opts = {
      admin: 1,
    }

    var i = 0
    groups.forEach((group) => {
      opts[group.id] = i++
    })

    return $http.post(api("event/" + this.id + "/ticketgroups_order"), opts)
  }

  return r
})
