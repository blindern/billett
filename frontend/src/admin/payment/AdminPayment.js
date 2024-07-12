import paymentAddTemplate from "./payment_add.html?raw"

angular.module("billett.admin").factory("AdminPayment", ($modal) => {
  return {
    newModal: (order) => {
      return $modal.open({
        template: paymentAddTemplate,
        controller: "AdminPaymentAddController as ctrl",
        resolve: {
          order: () => {
            return order
          },
        },
      })
    },
  }
})
