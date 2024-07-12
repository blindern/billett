import moment from "moment"

import { api } from "../../api"

angular
  .module("billett.admin")
  .controller(
    "AdminTicketgroupAddToOrderController",
    (
      $http,
      $modalInstance,
      $scope,
      eventgroup_id,
      getOrder,
      AdminEventgroup,
      addHandler,
    ) => {
      var ctrl = this
      ctrl.count = 0 // num tickets to add
      ctrl.amount = 0 // price to pay

      AdminEventgroup.get(
        { id: eventgroup_id },
        (eventgroup) => {
          ctrl.eventgroup = eventgroup

          generateEventList()
        },
        () => {
          $modalInstance.dismiss("eventgroup error")
        },
      )

      ctrl.cancel = () => {
        $modalInstance.dismiss("cancel")
      }

      // build list of possible events
      var generateEventList = () => {
        if (!ctrl.eventgroup) return

        // build list of ticketgroups
        ctrl.events = ctrl.eventgroup.events.filter((event) => {
          if (event.is_old && !ctrl.ticketfilter.show_old) return false
          return event.is_selling && event.ticketgroups.length > 0
        })

        // add fields for later filtering
        ctrl.events.forEach((event) => {
          event.dateinfo = moment
            .unix(event.time_start)
            .format("ddd D. MMM YYYY HH:mm")
        })
      }

      // filtering of events
      ctrl.ticketfilter = {}
      $scope.$watchCollection("ctrl.ticketfilter", () => {
        generateEventList()
      })

      // add/remove ticketgroup selection
      ctrl.ticketgroups_add = {}
      ctrl.changeTicketgroupNum = (ticketgroup, event, num) => {
        if (!(ticketgroup.id in ctrl.ticketgroups_add)) {
          ctrl.ticketgroups_add[ticketgroup.id] = {
            ticketgroup: ticketgroup,
            event: event,
            num: 0,
          }
        }

        var g = ctrl.ticketgroups_add[ticketgroup.id]
        g.num += num

        if (g.num == 0) {
          delete ctrl.ticketgroups_add[ticketgroup.id]
        }

        ctrl.count += num
        ctrl.amount += num * (ticketgroup.price + ticketgroup.fee)
      }

      // helper for filtering ticketgroups
      ctrl.ticketgroup_check = (actual, expected) => {
        if (expected) return true
        return actual
      }

      // add selected tickets
      ctrl.addTickets = () => {
        ctrl.sending = true

        var groups = {}
        Object.values(ctrl.ticketgroups_add).forEach((group) => {
          groups[group.ticketgroup.id] = group.num
        })

        getOrder().then((order) => {
          $http
            .post(api("order/" + order.id + "/create_tickets"), {
              ticketgroups: groups,
            })
            .then((response) => {
              addHandler().finally(() => {
                $modalInstance.close(response.data)
              })
            })
            .catch((err) => {
              alert("Ukjent feil oppsto ved registrering av billetter")
              delete ctrl.sending
            })
        })
      }
    },
  )
