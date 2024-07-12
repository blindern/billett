angular
  .module("billett.admin")
  .controller(
    "AdminPaymentgroupNewController",
    ($modalInstance, eventgroupId, AdminPaymentgroup) => {
      var ctrl = this

      ctrl.paymentgroup = new AdminPaymentgroup()
      ctrl.paymentgroup.eventgroup_id = eventgroupId

      ctrl.complete = () => {
        ctrl.sending = true
        ctrl.paymentgroup.$save(
          (paymentgroup) => {
            $modalInstance.close(paymentgroup)
          },
          (ret) => {
            ctrl.sending = false
            alert(ret)
          },
        )
      }

      ctrl.cancel = () => {
        $modalInstance.dismiss("cancel")
      }
    },
  )
