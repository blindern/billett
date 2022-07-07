import { api } from "../../api"

angular
  .module("billett.admin")
  .controller(
    "AdminOrderNewController",
    function (
      $http,
      $location,
      $modal,
      $q,
      $scope,
      $state,
      $stateParams,
      $timeout,
      focus,
      Page,
      AdminEventgroup,
      AdminPaymentgroup,
      AdminPrinter,
      AdminOrder,
    ) {
      var ctrl = this
      Page.setTitle("Ny ordre")

      ctrl.api = api

      var loader = Page.setLoading()
      AdminEventgroup.get(
        { id: $stateParams["id"] },
        function (res) {
          ctrl.eventgroup = res

          // if page is reloaded, check if we are in progress of a order
          if (localStorage["billett.neworder.id"]) {
            AdminOrder.get(
              { id: localStorage["billett.neworder.id"] },
              function (order) {
                ctrl.order = order
                buildTicketgroupList()
                loader()
              },
              function () {
                delete localStorage["billett.neworder.id"]
                loader()
                ctrl.addTickets()
              },
            )
          } else {
            loader()
            ctrl.addTickets()
          }
        },
        function () {
          $location.path("a")
        },
      )

      // -------------------------------------------------------------------------
      // actual order handling

      // reset order details
      var resetOrder = function () {
        ctrl.order = {}
        ctrl.total = 0
        ctrl.ticketgroups = null
        reloadHistory()
      }

      // create a blank order
      ctrl.createBlank = function () {
        getOrder()
      }

      // convert to actual order and mark as paid
      ctrl.completeOrder = function () {
        var loader = Page.setLoading()
        ctrl.saveEdit().then(
          function () {
            $http
              .post(api("order/" + ctrl.order.id + "/validate"), {
                paymentgroup: ctrl.paymentgroup.id,
                amount: ctrl.total,
                sendmail: true,
              })
              .success(function (ret) {
                loader()

                ctrl.order = ret
                Page.toast(
                  'Ordren ble vellykket opprettet. <a href="a/order/' +
                    ctrl.order.id +
                    '">Vis ordre</a>',
                  {
                    class: "success",
                    timeout: 15000,
                  },
                )

                printTickets()

                delete localStorage["billett.neworder.id"]
                resetOrder()
              })
              .error(function (err) {
                loader()
                if (err == "amount mismatched") {
                  alert(
                    "Noe i reservasjonen ser ut til å ha endret seg. Prøv på nytt.",
                  )
                  getOrder(true)
                } else {
                  alert(err)
                }
              })
          },
          function (err) {
            alert("Ukjent feil ved lagring av endringer: " + err)
          },
        )
      }

      // save edits to order
      ctrl.saveEdit = function () {
        return ctrl.order.$update()
      }

      // save as permanent reservation
      ctrl.saveOrder = function () {
        ctrl.order.$update(function () {
          delete localStorage["billett.neworder.id"]
          $state.go("admin-order", { id: ctrl.order.id })
        })
      }

      // abort new order (delete reservation and initialize new order)
      ctrl.abortOrder = function () {
        ctrl.order.$delete(
          function () {
            delete localStorage["billett.neworder.id"]
            resetOrder()
          },
          function () {
            alert("Feil ved sletting av ordre")
          },
        )
      }

      // get the order by using promise (create if not exists)
      var getOrder = function (reload) {
        return $q(function (resolve, reject) {
          // if id is set, the order exists already
          if (ctrl.order.id) {
            if (reload) {
              AdminOrder.get(
                { id: ctrl.order.id },
                function (order) {
                  ctrl.order = order

                  buildTicketgroupList()
                  resolve(ctrl.order)
                },
                function (err) {
                  reject(err)
                },
              )
            } else {
              resolve(ctrl.order)
            }

            return
          }

          // create new order
          var order = new AdminOrder({
            eventgroup_id: ctrl.eventgroup.id,
            name: ctrl.order.name,
            email: ctrl.order.email,
            phone: ctrl.order.phone,
            recruiter: ctrl.order.recruiter,
            comment: ctrl.order.comment,
          })

          order.$save(
            function (res) {
              ctrl.order = res

              localStorage["billett.neworder.id"] = ctrl.order.id

              buildTicketgroupList()
              resolve(ctrl.order)
            },
            function (res) {
              alert("Ukjent feil oppsto ved opprettelse av ordre")
              reject(res)
            },
          )
        })
      }

      // -------------------------------------------------------------------------
      // tickets reserved

      // rebuild ticketgroup list (call when order changes)
      // also update order total
      var buildTicketgroupList = function () {
        ctrl.ticketgroups = null
        ctrl.total = 0
        if (!ctrl.order.tickets || ctrl.order.tickets.length == 0) return

        if (ctrl.order.is_valid) {
          delete localStorage["billett.neworder.id"]
          $state.go("admin-order", { id: ctrl.order.id })
        }

        ctrl.ticketgroups = []
        var ticketgroups = {}
        ctrl.order.tickets.forEach(function (ticket) {
          if (!(ticket.ticketgroup.id in ticketgroups)) {
            ctrl.ticketgroups.push(
              (ticketgroups[ticket.ticketgroup.id] = {
                ticketgroup: ticket.ticketgroup,
                event: ticket.event,
                tickets: [],
                num: 0,
              }),
            )
          }

          var g = ticketgroups[ticket.ticketgroup.id]
          g.num++
          g.tickets.push(ticket)

          ctrl.total += ticket.ticketgroup.price + ticket.ticketgroup.fee
        })

        ctrl.ticketgroups.sort(function (left, right) {
          return left.event.time_start - right.event.time_start
        })
      }

      // delete a reserved ticket
      ctrl.deleteTicket = function (ticketgroup) {
        ticketgroup.working = true
        $http
          .delete(api("ticket/" + ticketgroup.tickets[0].id))
          .success(function () {
            getOrder(true).then(
              function () {
                ticketgroup.working = false
              },
              function () {
                alert("Error reloading order")
              },
            )
          })
          .error(function () {
            alert("Unknown error deleting order")
          })
      }

      // -------------------------------------------------------------------------
      // adding tickets to reservation

      ctrl.addTickets = function () {
        AdminOrder.addTicketsModal({
          eventgroup_id: function () {
            return ctrl.eventgroup.id
          },
          getOrder: function () {
            return getOrder
          },
          addHandler: function () {
            return function () {
              return $q(function (resolve) {
                // reload order with new data
                getOrder(true).then(
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
        }).result.then(function () {
          focus("namefocus")
        })
      }

      // -------------------------------------------------------------------------
      // list of previous orders

      var reloadHistory = function () {
        ctrl.previousOrders = null

        AdminOrder.query(
          {
            order: "-time",
            with: "tickets.event,tickets.ticketgroup,payments",
            limit: 3,
            filter: "eventgroup_id=" + $stateParams["id"] + ",is_admin=1",
          },
          function (data) {
            ctrl.previousOrders = data.result.map(function (order) {
              order.total_valid = 0
              order.total_reserved = 0
              order.tickets.forEach(function (ticket) {
                if (ticket.is_revoked) return
                order[ticket.is_valid ? "total_valid" : "total_reserved"] +=
                  ticket.ticketgroup.price + ticket.ticketgroup.fee
              })
              return order
            })
          },
        )
      }

      resetOrder()

      function printTickets() {
        if (!ctrl.printer) return

        var list = []
        ctrl.order.tickets.forEach(function (ticket) {
          if (ticket.is_revoked || !ticket.is_valid) return
          list.push(ticket.id)
        })

        if (list.length == 0) return

        AdminPrinter.printTickets(ctrl.printer.name, list).then(
          function () {
            Page.toast("Utskrift lagt i kø", { class: "success" })
          },
          function () {
            Page.toast("Ukjent feil oppsto!", { class: "warning" })
          },
        )
      }
    },
  )
