import { api } from "../../api"

import receiptTemplate from "./receipt.html?raw"

var module = angular.module("billett.guest")

module.config(($stateProvider) => {
  $stateProvider.state("order-complete", {
    url: "/order/complete",
    template: receiptTemplate,
    controller: "OrderController",
  })
})

module.controller("OrderController", (Page, $http, $location, $scope) => {
  $http.get(api("order/receipt")).then(
    (res) => {
      $scope.order = res.data.order
      $scope.payment = res.data.payment

      // group the entries by ticketgroup
      var ticketGroups = {}
      for (const ticket of res.data.order.tickets) {
        if (ticket.ticketgroup.id in ticketGroups) {
          ticketGroups[ticket.ticketgroup.id][5]++
        } else {
          ticketGroups[ticket.ticketgroup.id] = [
            res.data.order.order_text_id,
            ticket.event.id + "-" + ticket.ticketgroup.id,
            ticket.event.title + " (" + ticket.ticketgroup.title + ")",
            ticket.event.category,
            ticket.ticketgroup.price + ticket.ticketgroup.fee,
            1,
          ]
        }
      }
    },
    (err) => {
      //$location.path('/');
      console.log("err", err)
    },
  )
})
