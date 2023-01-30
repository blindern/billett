import { api } from "../../api"

import template from "./index.html?raw"

var module = angular.module("billett.guest")

module.config(function ($stateProvider) {
  $stateProvider.state("event", {
    url: "/event/:id",
    template,
    controller: "EventController as ctrl",
  })
})

module.controller(
  "EventController",
  function (
    AuthService,
    Page,
    EventReservation,
    $http,
    $scope,
    $location,
    $stateParams,
    $sce,
    $q,
  ) {
    var ctrl = this
    Page.setTitle("Arrangement")

    ctrl.api = api

    var loader = Page.setLoading()
    $http
      .get(api("event/" + encodeURIComponent($stateParams["id"])))
      .then(function (response) {
        const ret = response.data
        loader()

        // do we have an alias not being used?
        if (ret.alias != null && $stateParams["id"] != ret.alias) {
          $location.path("/event/" + ret.alias)
          return
        }

        $scope.event = ret
        ctrl.event_status = ret.web_selling_status
        if (
          ret.selling_text &&
          (ret.web_selling_status == "unknown" ||
            ret.web_selling_status == "no_web_tickets")
        ) {
          ctrl.event_status = "selling_text"
        }
      })
      .catch(function () {
        loader()
        Page.set404()
      })

    let reservation

    function reset() {
      reservation = null
      $scope.reservation = null
      $scope.contact = {}
      $scope.newres = {}
      $scope.newres.count = 0
      $scope.newres.total_amount = 0
      $scope.vipps_checkout = false
    }

    reset()

    // check for reservation
    $scope.loadingReservation = true
    EventReservation.restoreReservation()
      .then(function (reservationResult) {
        reservation = reservationResult
        $scope.reservation = $scope.contact = reservation.data
      })
      .catch(() => null)
      .finally(function () {
        $scope.loadingReservation = false
      })

    // add/remove ticketgroup selection
    $scope.changeTicketgroupNum = function (ticketgroup, num) {
      if (!("order_count" in ticketgroup)) ticketgroup.order_count = 0
      ticketgroup.order_count += num
      $scope.event.max_each_person -= num
      $scope.newres.total_amount += num * (ticketgroup.price + ticketgroup.fee)
      $scope.newres.count += num
    }

    // retrieve or create order
    var step1 = function () {
      return $q(function (resolve, reject) {
        if (reservation) {
          resolve(reservation)
        } else {
          // must create a reservation
          if ($scope.newres.count == 0) {
            Page.toast("Du må velge noen billetter.", { class: "warning" })
            return
          }

          var groups = {}
          angular.forEach($scope.event.ticketgroups, function (g) {
            var c = parseInt(g.order_count)
            if (c <= 0) return
            groups[g.id] = c
          })

          EventReservation.create($scope.event.id, groups).then(function (res) {
            reservation = res
            $scope.reservation = res.data
            resolve(res)
          }, reject)
        }
      })
    }

    // update order with contact info
    var step2 = function () {
      var data = {
        recruiter: $scope.contact.recruiter,
      }
      return reservation.update(data)
    }

    $scope.placeOrder = function (force) {
      // make sure reservation exists, or create it
      step1().then(
        function () {
          console.log("pre step2")
          // update reservation contact data
          step2().then(
            function () {
              // send to payment
              reservation.place(force).then(
                function (response) {
                  if (force) {
                    // details about the order is fetched at the
                    // completed url
                    $location.path("order/complete")
                  } else {
                    $scope.vipps_checkout = true

                    const checkout = () => {
                      VippsCheckout({
                        checkoutFrontendUrl: response.data.checkoutFrontendUrl,
                        iFrameContainerId: "vipps-checkout-frame-container",
                        language: "no",
                        token: response.data.token,
                      })
                    }

                    if (window.VippsCheckout != null) {
                      // Schedule to after render.
                      setTimeout(() => void checkout(), 0)
                    } else {
                      const script = document.createElement("script")
                      script.src =
                        "https://checkout.vipps.no/vippsCheckoutSDK.js"
                      script.onload = checkout
                      document.head.append(script)
                    }
                  }
                },
                function (err) {
                  // sending to payment failed
                  // TODO: handle error cases
                  const msg = "data" in err ? err.data : err
                  alert("Ukjent feil oppsto ved lagring av ordre: " + msg)
                },
              )
            },
            function (err) {
              // updating order failed
              if (err == "data validation failed") {
                Page.toast("Ugyldig inndata i skjemaet.", { class: "warning" })
              } else {
                const msg = "data" in err ? err.data : err
                alert("Ukjent feil oppsto ved lagring av kontaktdata: " + msg)
              }
            },
          )
        },
        function (err) {
          // creating reservation failed
          // TODO: handle error cases
          const msg = "data" in err ? err.data : err
          alert("Ukjent feil oppsto ved henting av reservasjon: " + msg)
        },
      )
    }

    // abort order
    $scope.abortOrder = function () {
      reservation.abort().then(
        function () {
          reset()
        },
        function (err) {
          alert("Klarte ikke å avbryte reservasjonen. Ukjent feil: " + err)
        },
      )
    }
  },
)
