import { firstValueFrom } from "rxjs"
import { api } from "../../api"

var module = angular.module("billett.admin")

module.controller(
  "AdminEventController",
  (
    Page,
    $stateParams,
    AdminEvent,
    AdminPrinter,
    $location,
    $scope,
    FileUploader,
    AuthService,
  ) => {
    Page.setTitle("Arrangement")

    $scope.api = api

    var loader = Page.setLoading()
    AdminEvent.get(
      { id: $stateParams["id"] },
      (ret) => {
        loader()
        $scope.event = ret
      },
      (err) => {
        loader()
        Page.set404()
      },
    )

    $scope.deleteEvent = () => {
      if ($scope.event.ticketgroups.length > 0) {
        Page.toast("Du må først slette billettgruppene som er tilegnet.", {
          class: "danger",
        })
        return
      }

      var group = $scope.event.eventgroup.id
      $scope.event.$delete(
        () => {
          $location.path("/a/eventgroup/" + group)
        },
        (err) => {
          alert(err)
        },
      )
    }

    // uploading of image
    $scope.uploader = new FileUploader({
      url: api("event/" + $stateParams["id"] + "/image"),
      withCredentials: true,
      removeAfterUpload: true,
    })
    // inject the csrf token
    firstValueFrom(AuthService.csrfToken$).then((csrfToken) => {
      $scope.uploader.headers["X-Csrf-Token"] = csrfToken
    })
    $scope.uploader.onAfterAddingFile = (fileItem) => {
      $scope.uploadprogress = true
      fileItem.onSuccess = (res) => {
        $scope.uploadprogress = null
        $scope.image_version = new Date().getTime()
      }
      fileItem.onError = () => {
        alert("Ukjent feil ved opplasting!")
      }
      fileItem.upload()
    }

    // sorting of ticket groups
    this.onTicketgroupsOrder = (ev) => {
      $scope.event.setTicketgroupsOrder(ev.models)
    }

    this.previewTicketPrint = (ticketgroupid) => {
      AdminPrinter.printSelectModal(async (printername) => {
        try {
          await AdminPrinter.printPreviewTicket(printername, ticketgroupid)
          Page.toast("Utskrift lagt i kø", { class: "success" })
        } catch (e) {
          Page.toast("Ukjent feil oppsto!", { class: "warning" })
          throw e
        }
      })
    }
  },
)
