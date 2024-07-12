angular
  .module("billett.admin")
  .controller(
    "AdminPaymentgroupItemController",
    ($stateParams, AdminPaymentgroup, AdminPaymentsource, Page) => {
      var ctrl = this
      ctrl.show_details = false

      // note:
      // payments are registered as debet, so a payment for 100 means 100, while -100 means refund
      // tickets are registered as kredit, so a sale for 30 means -30, while 30 means revoked ticket

      loadPaymentgroup()

      function loadPaymentgroup() {
        var loader = Page.setLoading()
        return AdminPaymentgroup.get(
          { id: $stateParams["id"] },
          (ret) => {
            loader()
            ctrl.paymentgroup = ret

            ctrl.totals = {
              payments: 0,
              valid: 0,
              revoked: 0,
            }

            var events = {}
            var orders = {}

            var addOrderBalance = (order, value, is_payment) => {
              if (!(order.id in orders)) {
                order.paymentgroup_balance = {
                  ticket_sales: 0,
                  ticket_revoked: 0,
                  payments: 0,
                  refunds: 0,
                  total: 0,
                }
                orders[order.id] = order
              }

              order = orders[order.id]
              var t = is_payment
                ? value >= 0
                  ? "payments"
                  : "refunds"
                : value >= 0
                  ? "ticket_revoked"
                  : "ticket_sales"

              order.paymentgroup_balance[t] += value
              order.paymentgroup_balance["total"] += value
            }

            var ticketgroups = {}
            var getEvent = (event) => {
              if (!(event.id in events)) {
                event.ticketgroups.forEach((g) => {
                  g.paymentgroup_balance = 0
                  g.paymentgroup_count = 0
                  ticketgroups[g.id] = g
                })
                event.paymentgroup_balance = 0
                event.paymentgroup_count = 0
                events[event.id] = event
              }
              return events[event.id]
            }

            var addTicket = (ticket, multiply) => {
              var p = ticket.ticketgroup.price + ticket.ticketgroup.fee
              var ev = getEvent(ticket.event)
              ev.paymentgroup_balance += p * multiply
              ev.paymentgroup_count += multiply
              ticketgroups[ticket.ticketgroup.id].paymentgroup_balance +=
                p * multiply
              ticketgroups[ticket.ticketgroup.id].paymentgroup_count += multiply
            }

            ctrl.paymentgroup.payments.forEach((payment) => {
              ctrl.totals.payments += payment.amount * 1
              addOrderBalance(payment.order, payment.amount * 1, true)
            })
            ctrl.paymentgroup.valid_tickets.forEach((ticket) => {
              ctrl.totals.valid -=
                ticket.ticketgroup.price + ticket.ticketgroup.fee
              addOrderBalance(
                ticket.order,
                -ticket.ticketgroup.price - ticket.ticketgroup.fee,
              )
              addTicket(ticket, -1)
            })
            ctrl.paymentgroup.revoked_tickets.forEach((ticket) => {
              ctrl.totals.revoked +=
                ticket.ticketgroup.price + ticket.ticketgroup.fee
              addOrderBalance(
                ticket.order,
                ticket.ticketgroup.price + ticket.ticketgroup.fee,
              )
              addTicket(ticket, 1)
            })

            // convert events to array list
            events = ((tmp) => {
              var list = []
              for (const event of events) {
                list.push(event)
              }
              list.sort((left, right) => {
                return left.time_start - right.time_start
              })
              return list
            })(events)

            // group events by category
            var categories = events.reduce((prev, event) => {
              if (!(event.category in prev)) {
                prev[event.category] = {
                  name: event.category,
                  total: 0,
                  events: [],
                }
              }

              event.ticketgroups = event.ticketgroups.filter(
                (ticketgroup) => {
                  return ticketgroup.paymentgroup_balance != 0
                },
              )

              prev[event.category].events.push(event)
              prev[event.category].total += event.paymentgroup_balance
              return prev
            }, {})
            ctrl.categories = []
            for (const category of categories) {
              ctrl.categories.push(category)
            }
            ctrl.categories.sort((left, right) => {
              return left.name.localeCompare(right.name)
            })

            // isolate orders not in balance (only looking at this paymentgroup, not the real balance of the order)
            ctrl.orders_inbalance = []
            for (const order of orders) {
              if (order.paymentgroup_balance["total"] != 0) {
                ctrl.orders_inbalance.push(order)
              }
            }
            ctrl.orders_inbalance.sort((left, right) => {
              return left.time - right.time
            })

            setupPaymentsources()
          },
        )
      }

      ctrl.startEdit = () => {
        ctrl.edit = {
          title: ctrl.paymentgroup.title,
          description: ctrl.paymentgroup.description,
        }
      }

      ctrl.abortEdit = () => {
        delete ctrl.edit
      }

      ctrl.save = () => {
        ctrl.paymentgroup.title = ctrl.edit.title
        ctrl.paymentgroup.description = ctrl.edit.description
        ctrl.paymentgroup.$update((ret) => {
          ctrl.paymentgroup = ret
          delete ctrl.edit
        })
      }

      ctrl.close = () => {
        if (
          !ctrl.paymentgroup.time_end &&
          confirm(
            "Er du sikker på at du vil lukke betalingsgruppen? Dette gjøres kun ved oppgjør av økonomi. Kontroller evt. avvik først. Handlingen kan ikke angres.",
          )
        ) {
          ctrl.paymentgroup.close().then((response) => {
            ctrl.paymentgroup = response.data
          })
        }
      }

      ctrl.newPaymentsource = () => {
        AdminPaymentsource.newModal(ctrl.paymentgroup).result.then(() => {
          loadPaymentgroup()
        })
      }

      ctrl.deletePaymentsource = (paymentsource) => {
        if (
          confirm(
            "Er du sikker på at du vil slette registreringen? Du kan senere hente den frem igjen på den detaljerte visningen.",
          )
        ) {
          new AdminPaymentsource(paymentsource).$delete(
            () => {
              Page.toast("Registeringen ble slettet", { class: "success" })
              loadPaymentgroup()
            },
            () => {
              Page.toast("Ukjent feil ved sletting av registering", {
                class: "warning",
              })
            },
          )
        }
      }

      initPaymentsources()
      function initPaymentsources() {
        ctrl.ps = {}
      }

      function setupPaymentsources() {
        ctrl.ps.sum = 0

        var cashgroups_link = {}
        ctrl.ps.cashgroups = []
        ctrl.ps.other = []
        ctrl.ps.payments_deviation_prefix =
          ctrl.paymentgroup.eventgroup.paymentsources_data[
            "payments_deviation_prefix"
          ] || "Kassedifferanse"
        ctrl.ps.orders_deviation_prefix =
          ctrl.paymentgroup.eventgroup.paymentsources_data[
            "orders_deviation_prefix"
          ] || "Utestående beløp"

        ctrl.paymentgroup.paymentsources.forEach((paymentsource) => {
          if (!paymentsource.is_deleted) ctrl.ps.sum += paymentsource.amount

          if (paymentsource.type == "cash") {
            processCashItem(paymentsource)
          } else {
            ctrl.ps.other.push(paymentsource)
          }
        })

        buildCashTable()

        function processCashItem(paymentsource) {
          if (paymentsource.is_deleted) {
            paymentsource.title = "Slettede oppføringer: " + paymentsource.title
          }

          if (!(paymentsource.title in cashgroups_link)) {
            cashgroups_link[paymentsource.title] = {
              title: paymentsource.title,
              cashunique: [
                "1",
                "5",
                "10",
                "20",
                "50",
                "100",
                "200",
                "500",
                "1000",
              ], // 'other' might be existent
              cashuniquesum: {},
              cols: [],
              rows: null,
              total: 0,
              is_deleted: paymentsource.is_deleted,
            }
            ctrl.ps.cashgroups.push(cashgroups_link[paymentsource.title])
          }

          var group = cashgroups_link[paymentsource.title]

          Object.entries(paymentsource.data || {}).forEach(([key, val]) => {
            if (group.cashunique.indexOf(key) === -1) {
              group.cashunique.push(key)
            }
            group.cashuniquesum[key] = (group.cashuniquesum[key] || 0) + val
          })

          group.total += paymentsource.amount
          group.cols.push(paymentsource)
        }

        function buildCashTable() {
          ctrl.ps.cashgroups.forEach((group) => {
            group.cashunique.sort((a, b) => {
              return a - b
            })
            group.rows = group.cashunique.map((key) => {
              var is_num = /^\d+(\.\d+)?/.test(key)
              var m = is_num ? parseFloat(key) : 1
              var total = group.cashuniquesum[key] || 0

              return {
                key: key,
                is_num: is_num,
                items: [],
                total: total,
                amount: total * m,
              }
            })

            group.cols.forEach((paymentsource) => {
              var i = 0
              group.cashunique.forEach((key) => {
                group.rows[i].items.push(paymentsource.data[key] || "")
                i++
              })
            })
          })
        }
      }
    },
  )
