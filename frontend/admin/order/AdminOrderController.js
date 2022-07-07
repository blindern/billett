import { api } from "../../api"

import emailModalTemplate from "./email_modal.html?raw"

var module = angular.module("billett.admin")

module.controller(
  "AdminOrderController",
  function (
    $http,
    $modal,
    $q,
    $state,
    $stateParams,
    Page,
    AdminOrder,
    AdminPaymentgroup,
    AdminPrinter,
    AdminTicket,
    AdminPayment,
  ) {
    var ctrl = this
    Page.setTitle("Ordre")

    ctrl.api = api

    var loadOrder = function () {
      return AdminOrder.get({ id: $stateParams["id"] }, function (ret) {
        ctrl.order = ret

        // calc order total and generate list of valid tickets
        ctrl.validtickets = []
        ctrl.total = 0
        ctrl.total_reserved = 0
        ctrl.ticketcount = {
          reserved: 0,
          revoked: 0,
          valid: 0,
        }
        ctrl.order.tickets.forEach(function (ticket) {
          if (!ticket.is_valid) {
            ctrl.total_reserved +=
              ticket.ticketgroup.price + ticket.ticketgroup.fee
            ctrl.ticketcount.reserved++
          } else if (!ticket.is_revoked) {
            ctrl.total += ticket.ticketgroup.price + ticket.ticketgroup.fee
            ctrl.validtickets.push(ticket.id)
            ctrl.ticketcount.valid++
          } else {
            ctrl.ticketcount.revoked++
          }
        })

        // total paid amount
        ctrl.total_paid = 0
        ctrl.order.payments.forEach(function (payment) {
          ctrl.total_paid += 1 * payment.amount
        })
      }).$promise
    }

    var loader = Page.setLoading()
    loadOrder().then(
      function () {
        loader()
      },
      function () {
        loader()
        Page.set404()
      },
    )

    var thenReloadOrError = function (q) {
      q.then(
        function () {
          loadOrder()
        },
        function (err) {
          alert(err)
        },
      )
    }

    var editFields = ["name", "email", "phone", "recruiter", "comment"]

    // start edit mode (order details)
    ctrl.startEdit = function () {
      ctrl.edit = editFields.reduce(function (prev, cur) {
        prev[cur] = ctrl.order[cur]
        return prev
      }, {})
    }

    // abort edit mode (order details)
    ctrl.abortEdit = function () {
      delete ctrl.edit
    }

    // save order details when editing
    ctrl.save = function () {
      editFields.forEach(function (field) {
        ctrl.order[field] = ctrl.edit[field]
      })
      ctrl.order.$update(function (ret) {
        ctrl.order = ret
        delete ctrl.edit
      })
    }

    // delete reservation (of order)
    ctrl.deleteReservation = function () {
      var eventgroup_id = ctrl.order.eventgroup.id
      ctrl.order.$delete(
        function () {
          $state.go("admin-orders", { eventgroup_id: eventgroup_id })
        },
        function () {
          alert("Feil ved sletting av ordre")
        },
      )
    }

    ctrl.completeOrder = function () {
      AdminPaymentgroup.selectModal({
        order: function () {
          return ctrl.order
        },
        actionText: function () {
          return "Marker som betalt"
        },
        amount: function () {
          return ctrl.total_reserved
        },
      }).result.then(function (paymentgroup) {
        $http
          .post(api("order/" + ctrl.order.id + "/validate"), {
            paymentgroup: paymentgroup.id,
            amount: ctrl.total_reserved,
            sendmail: false,
          })
          .success(function () {
            loadOrder()
          })
          .error(function (err) {
            if (err == "amount mismatched") {
              alert("Noe i ordren ser ut til å ha endret seg. Prøv på nytt.")
              loadOrder()
            } else {
              alert(err)
            }
          })
      })
    }

    ctrl.convertOrder = function () {
      thenReloadOrError($http.post(api("order/" + ctrl.order.id + "/validate")))
    }

    // start new tickets form
    ctrl.addTickets = function () {
      AdminOrder.addTicketsModal({
        eventgroup_id: function () {
          return ctrl.order.eventgroup.id
        },
        getOrder: function () {
          return function () {
            return $q(function (resolve) {
              resolve(ctrl.order)
            })
          }
        },
        addHandler: function () {
          return function (ticketgroups) {
            return $q(function (resolve, reject) {
              // reload order with new data
              loadOrder().then(
                function () {
                  resolve()
                },
                function () {
                  alert(
                    "Ukjent feil oppsto ved forsøk på å laste ordren på nytt",
                  )
                  resolve() // consider it a success anyways
                },
              )
            })
          }
        },
      })
    }

    // revoke specific ticket
    ctrl.revokeTicket = function (ticket) {
      AdminTicket.revokeModal(ctrl.order, ticket).result.then(function () {
        loadOrder()
      })
    }

    // validate specific ticket
    ctrl.validateTicket = function (ticket) {
      AdminPaymentgroup.selectModal({
        order: function () {
          return ctrl.order
        },
        actionText: function () {
          return "Inntektsfør"
        },
        amount: function () {
          return ticket.ticketgroup.price + ticket.ticketgroup.fee
        },
      }).result.then(function (paymentgroup) {
        thenReloadOrError(
          $http.post(api("ticket/" + ticket.id + "/validate"), {
            paymentgroup_id: paymentgroup.id,
          }),
        )
      })
    }

    // delete ticket reservation
    ctrl.deleteTicket = function (ticket) {
      $http
        .delete(api("ticket/" + ticket.id))
        .success(function () {
          console.log("ticket deleted")
        })
        .finally(function () {
          loadOrder()
        })
    }

    // start new payment form
    ctrl.newPayment = function () {
      AdminPayment.newModal(ctrl.order).result.then(function () {
        loadOrder()
      })
    }

    // send email
    ctrl.email = function () {
      var modal = $modal.open({
        template: emailModalTemplate,
        controller: "AdminOrderEmailController as ctrl",
        resolve: {
          order: function () {
            return ctrl.order
          },
        },
      })

      modal.result.then(function () {
        Page.toast("E-post ble sendt", { class: "success" })
      })
    }

    ctrl.printTickets = function () {
      AdminPrinter.printSelectModal(function (printername) {
        return $q(function (resolve, reject) {
          AdminPrinter.printTickets(printername, ctrl.validtickets).then(
            function () {
              Page.toast("Utskrift lagt i kø", { class: "success" })
              resolve()
            },
            function () {
              Page.toast("Ukjent feil oppsto!", { class: "warning" })
              reject()
            },
          )
        })
      })
    }

    ctrl.printTicket = function (ticketid) {
      AdminPrinter.printSelectModal(function (printername) {
        return $q(function (resolve, reject) {
          AdminPrinter.printTicket(printername, ticketid).then(
            function () {
              Page.toast("Utskrift lagt i kø", { class: "success" })
              resolve()
            },
            function () {
              Page.toast("Ukjent feil oppsto!", { class: "warning" })
              reject()
            },
          )
        })
      })
    }
  },
)
