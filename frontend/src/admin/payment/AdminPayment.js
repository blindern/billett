import paymentAddTemplate from "./payment_add.html?raw"

angular.module("billett.admin").factory("AdminPayment", function ($modal) {
  return {
    newModal: function (order) {
      return $modal.open({
        template: paymentAddTemplate,
        controller: "AdminPaymentAddController as ctrl",
        resolve: {
          order: function () {
            return order
          },
        },
      })
    },
  }
})
