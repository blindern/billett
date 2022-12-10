import { api } from "../../api"

var module = angular.module("billett.admin")

module.controller(
  "AdminEventController",
  function (
    Page,
    $q,
    $stateParams,
    AdminEvent,
    AdminPrinter,
    $location,
    $scope,
    FileUploader,
    AuthService,
  ) {
    Page.setTitle("Arrangement")

    $scope.api = api

    var loader = Page.setLoading()
    AdminEvent.get(
      { id: $stateParams["id"] },
      function (ret) {
        loader()
        $scope.event = ret
      },
      function (err) {
        loader()
        Page.set404()
      },
    )

    $scope.deleteEvent = function () {
      if ($scope.event.ticketgroups.length > 0) {
        Page.toast("Du må først slette billettgruppene som er tilegnet.", {
          class: "danger",
        })
        return
      }

      var group = $scope.event.eventgroup.id
      $scope.event.$delete(
        function () {
          $location.path("/a/eventgroup/" + group)
        },
        function (err) {
          alert(err)
        },
      )
    }

    // uploading of image
    $scope.uploader = new FileUploader({
      url: api("event/" + $stateParams["id"] + "/image"),
      removeAfterUpload: true,
    })
    // inject the csrf token
    AuthService.getCsrfToken().then((csrfToken) => {
      $scope.uploader.headers["X-Csrf-Token"] = csrfToken
    })
    $scope.uploader.onAfterAddingFile = function (fileItem) {
      $scope.uploadprogress = true
      fileItem.onSuccess = function (res) {
        $scope.uploadprogress = null
        $scope.image_version = new Date().getTime()
      }
      fileItem.onError = function () {
        alert("Ukjent feil ved opplasting!")
      }
      fileItem.upload()
    }

    // sorting of ticket groups
    this.onTicketgroupsOrder = function (ev) {
      $scope.event.setTicketgroupsOrder(ev.models)
    }

    this.previewTicketPrint = function (ticketgroupid) {
      AdminPrinter.printSelectModal(function (printername) {
        return $q(function (resolve, reject) {
          AdminPrinter.printPreviewTicket(printername, ticketgroupid).then(
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
