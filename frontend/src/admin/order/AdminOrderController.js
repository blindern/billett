import { api } from "../../api"

import emailModalTemplate from "./email_modal.html?raw"

var module = angular.module("billett.admin")

module.controller(
  "AdminOrderController",
  (
    $http,
    $modal,
    $state,
    $stateParams,
    Page,
    AdminOrder,
    AdminPaymentgroup,
    AdminPrinter,
    AdminTicket,
    AdminPayment,
  ) => {
    var ctrl = this
    Page.setTitle("Ordre")

    ctrl.api = api

    var loadOrder = () => {
      return AdminOrder.get({ id: $stateParams["id"] }, (ret) => {
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
        ctrl.order.tickets.forEach((ticket) => {
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
        ctrl.order.payments.forEach((payment) => {
          ctrl.total_paid += 1 * payment.amount
        })
      }).$promise
    }

    var loader = Page.setLoading()
    loadOrder().then(
      () => {
        loader()
      },
      () => {
        loader()
        Page.set404()
      },
    )

    var thenReloadOrError = (q) => {
      q.then(
        () => {
          loadOrder()
        },
        (err) => {
          alert(err)
        },
      )
    }

    var editFields = ["name", "email", "phone", "recruiter", "comment"]

    // start edit mode (order details)
    ctrl.startEdit = () => {
      ctrl.edit = editFields.reduce((prev, cur) => {
        prev[cur] = ctrl.order[cur]
        return prev
      }, {})
    }

    // abort edit mode (order details)
    ctrl.abortEdit = () => {
      delete ctrl.edit
    }

    // save order details when editing
    ctrl.save = () => {
      editFields.forEach((field) => {
        ctrl.order[field] = ctrl.edit[field]
      })
      ctrl.order.$update((ret) => {
        ctrl.order = ret
        delete ctrl.edit
      })
    }

    // delete reservation (of order)
    ctrl.deleteReservation = () => {
      var eventgroup_id = ctrl.order.eventgroup.id
      ctrl.order.$delete(
        () => {
          $state.go("admin-orders", { eventgroup_id: eventgroup_id })
        },
        () => {
          alert("Feil ved sletting av ordre")
        },
      )
    }

    ctrl.completeOrder = () => {
      AdminPaymentgroup.selectModal({
        order: () => {
          return ctrl.order
        },
        actionText: () => {
          return "Marker som betalt"
        },
        amount: () => {
          return ctrl.total_reserved
        },
      }).result.then((paymentgroup) => {
        $http
          .post(api("order/" + ctrl.order.id + "/validate"), {
            paymentgroup: paymentgroup.id,
            amount: ctrl.total_reserved,
            sendmail: false,
          })
          .then(() => {
            loadOrder()
          })
          .catch((err) => {
            if (err.data == "amount mismatched") {
              alert("Noe i ordren ser ut til å ha endret seg. Prøv på nytt.")
              loadOrder()
            } else {
              alert(err.data)
            }
          })
      })
    }

    ctrl.convertOrder = () => {
      thenReloadOrError($http.post(api("order/" + ctrl.order.id + "/validate")))
    }

    // start new tickets form
    ctrl.addTickets = () => {
      AdminOrder.addTicketsModal({
        eventgroup_id: () => {
          return ctrl.order.eventgroup.id
        },
        getOrder: () => {
          return async () => {
            return ctrl.order
          }
        },
        addHandler: () => {
          return async (ticketgroups) => {
            try {
              // reload order with new data
              const data = await loadOrder()
            } catch (e) {
              console.error(e)
              alert("Ukjent feil oppsto ved forsøk på å laste ordren på nytt")
              // consider it a success anyways
            }
          }
        },
      })
    }

    // revoke specific ticket
    ctrl.revokeTicket = (ticket) => {
      AdminTicket.revokeModal(ctrl.order, ticket).result.then(() => {
        loadOrder()
      })
    }

    // validate specific ticket
    ctrl.validateTicket = (ticket) => {
      AdminPaymentgroup.selectModal({
        order: () => {
          return ctrl.order
        },
        actionText: () => {
          return "Inntektsfør"
        },
        amount: () => {
          return ticket.ticketgroup.price + ticket.ticketgroup.fee
        },
      }).result.then((paymentgroup) => {
        thenReloadOrError(
          $http.post(api("ticket/" + ticket.id + "/validate"), {
            paymentgroup_id: paymentgroup.id,
          }),
        )
      })
    }

    // delete ticket reservation
    ctrl.deleteTicket = (ticket) => {
      $http
        .delete(api("ticket/" + ticket.id))
        .then(() => {
          console.log("ticket deleted")
        })
        .finally(() => {
          loadOrder()
        })
    }

    // start new payment form
    ctrl.newPayment = () => {
      AdminPayment.newModal(ctrl.order).result.then(() => {
        loadOrder()
      })
    }

    // send email
    ctrl.email = () => {
      var modal = $modal.open({
        template: emailModalTemplate,
        controller: "AdminOrderEmailController as ctrl",
        resolve: {
          order: () => {
            return ctrl.order
          },
        },
      })

      modal.result.then(() => {
        Page.toast("E-post ble sendt", { class: "success" })
      })
    }

    ctrl.printTickets = () => {
      AdminPrinter.printSelectModal(async (printername) => {
        try {
          await AdminPrinter.printTickets(printername, ctrl.validtickets)
          Page.toast("Utskrift lagt i kø", { class: "success" })
        } catch (e) {
          Page.toast("Ukjent feil oppsto!", { class: "warning" })
          throw e
        }
      })
    }

    ctrl.printTicket = (ticketid) => {
      AdminPrinter.printSelectModal(async (printername) => {
        try {
          await AdminPrinter.printTicket(printername, ticketid)
          Page.toast("Utskrift lagt i kø", { class: "success" })
        } catch (e) {
          Page.toast("Ukjent feil oppsto!", { class: "warning" })
          throw e
        }
      })
    }
  },
)
