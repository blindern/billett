<?php namespace Blindern\UKA\Billett\Helpers;

use \Blindern\UKA\Billett\Order;
use \Blindern\UKA\Billett\Payment;

class VippsPaymentModule {
    private $client;

    function __construct()
    {
        $this->client = new \GuzzleHttp\Client();
    }

    /**
     * Initiate Vipps checkout session.
     */
    public function initiateSession(Order $order)
    {
        $sessionUrl = \Config::get('vipps.api_base_url') . "/checkout/v3/session";

        $opts = [
            "headers" => $this->getVippsCheckoutHeaders(),
            "json" => [
                "merchantInfo" => array(
                    "callbackUrl" => \Config::get('vipps.callback_url'),
                    "returnUrl" => str_replace("{orderId}", $order->id, \Config::get('vipps.return_url_template')),
                    // We don't bother with tokens - we don't trust the callback data anyways
                    // as it only triggers a payment check.
                    "callbackAuthorizationToken" => "",
                    "termsAndConditionsUrl" => url("salgsbetingelser"),
                ),
                "transaction" => array(
                    "amount" => array(
                        "currency" => "NOK",
                        "value" => $order->getTotalAmount() * 100,
                    ),
                    "reference" => $order->order_text_id,
                    "paymentDescription" => $order->getPaymentDescription(),
                ),
                "configuration" => array(
                    "elements" => "PaymentAndContactInfo",
                ),
            ],
        ];

        // TODO: Improve error handling.

        try {
            $response = $this->client->post($sessionUrl, $opts);
        } catch (\GuzzleHttp\Exception\BadResponseException $e) {
            $response = $e->getResponse();
            $statusCode = $response->getStatusCode();
            \Log::error("Unexpected status from Vipps (order {$order->order_text_id}): $statusCode. Body: {$response->getBody()}");
            throw new \Exception("Unexpected status from Vipps: $statusCode");
        }

        $body = json_decode($response->getBody(), true);

        return array(
            "checkoutFrontendUrl" => $body["checkoutFrontendUrl"],
            "token" => $body["token"],
        );
    }

    /**
     * Check for payment status on an order and handle payments.
     *
     * @return Payment if paid (now or before)
     */
    public function checkForPayment(Order &$order)
    {
        // make sure the order is locked when we process it here
        // in case the capture/browser locks the other user, retry a couple of times to avoid lock wait timeout
        $i = 0;
        while (true) {
            $i++;

            try {
                return \DB::transaction(function() use (&$order) {
                    \DB::table('orders')->where('id', $order->id)->lockForUpdate()->get();

                    \Log::info("Begin payment handling for {$order->order_text_id}");

                    // fetch the order again to make sure we have fresh values
                    // we overwrite the order that is sent to the method because the variable is referenced
                    $class = ModelHelper::getModelPath('Order');
                    $order = $class::findOrFail($order->id);

                    $body = $this->getSessionDetails($order->order_text_id);

                    $sessionState = $body["sessionState"];
                    $amount = $body["paymentDetails"]["amount"]["value"];
                    $capturedAmount = $body["paymentDetails"]["aggregate"]["capturedAmount"]["value"];

                    if ($sessionState != "PaymentSuccessful") {
                        // No valid payment.
                        return null;
                    }

                    $expectedAmount = $order->getTotalAmount() * 100;
                    if ($amount != $expectedAmount) {
                        // I don't think this can happen?
                        throw new \Exception("Amount mismatch for order {$order->order_text_id}");
                    }

                    if ($capturedAmount == 0) {
                        $this->capture($order->order_text_id, $amount);
                    }

                    $payment = $order->payments()->where('transaction_id', 'Vipps')->where('order_id', $order->id)->first();
                    if ($payment) {
                        \Log::info("Already have payment stored for order {$order->order_text_id}");
                        return $payment;
                    }

                    if (!$payment) {
                        $payment = new Payment;
                        $payment->order()->associate($order);
                        $payment->is_web = true;
                        // We don't seem to retrieve any real transaction ID in the checkout session response.
                        $payment->transaction_id = "Vipps";
                    }
                    $payment->time = time();
                    $payment->amount = $amount/100.0;
                    $payment->status = $body["paymentDetails"]["state"];
                    $payment->data = json_encode(array('vipps_session' => $body));
                    $payment->save();

                    $order->time = time();

                    $order->name = $body["billingDetails"]["firstName"] . " " . $body["billingDetails"]["lastName"];
                    $order->email = $body["billingDetails"]["email"];
                    $order->phone = $body["billingDetails"]["phoneNumber"];

                    $order->modifyBalance($amount/100.0);

                    if (!$order->isReservation()) {
                        \Log::info("Order is not a reservation but payment registered (order {$order->order_text_id})");
                    } else {
                        \Log::info("Marking order {$order->order_text_id} as complete");
                        if ($order->markComplete()) {
                            // send the receipt
                            $order->sendEmailOrderWebComplete();
                        }
                    }

                    $order->save();
                    return $payment;
                });
            } catch (\Illuminate\Database\QueryException $e) {
                if ($i == 5) throw $e;
            }
        }
    }

    private function capture($reference, $amount)
    {
        $captureUrl = \Config::get('vipps.api_base_url') . "/epayment/v1/payments/" . rawurlencode($reference) . "/capture";

        $response = $this->client->post($captureUrl, [
            "headers" => [
                "Authorization" => "Bearer " . $this->getAccessToken(),
                "Merchant-Serial-Number" => \Config::get('vipps.merchant_id'),
                "Ocp-Apim-Subscription-Key" => \Config::get('vipps.subscription_key'),
                "Idempotency-Key" => "request1",
            ],
            "json" => [
                "modificationAmount" => [
                    "currency" => "NOK",
                    "value" => $amount
                ],
            ],
        ]);

        $statusCode = $response->getStatusCode();
        $body = json_decode($response->getBody(), true);

        \Log::info("Response from Vipps capture (reference $reference): $statusCode - body: {$response->getBody()}");

        if ($body["aggregate"]["capturedAmount"]["value"] != $body["amount"]["value"]) {
            \Log::info("Amount not captured yet - polling (reference $reference)");

            $i = 0;
            while (true) {
                $details = $this->getSessionDetails($reference);
                if ($details["paymentDetails"]["aggregate"]["capturedAmount"]["value"] == $details["paymentDetails"]["amount"]["value"]) {
                    \Log::info("Capture detected (reference $reference)");
                } else {
                    \Log::info("Still not captured... (reference $reference)");
                }

                if ($i == 10) {
                    // I think it should be captured within this time.
                    throw new \Exception("Payment still not captured");
                }

                $i++;
                sleep(2);
            }
        }
    }

    private function getSessionDetails($reference)
    {
        $sessionUrl = \Config::get('vipps.api_base_url') . "/checkout/v3/session/" . rawurlencode($reference);

        try {
            $response = $this->client->get($sessionUrl, [
                "headers" => $this->getVippsCheckoutHeaders()
            ]);
        } catch (\GuzzleHttp\Exception\BadResponseException $e) {
            $response = $e->getResponse();
            $statusCode = $response->getStatusCode();
            \Log::error("Unexpected status from Vipps: $statusCode. Body: {$response->getBody()}");
            throw new \Exception("Unexpected status from Vipps: $statusCode");
        }

        return json_decode($response->getBody(), true);
    }

    private function getAccessToken()
    {
        $accessTokenUrl = \Config::get('vipps.api_base_url') . "/accessToken/get";

        $response = $this->client->post($accessTokenUrl, [
            "headers" => [
                "client_id" => \Config::get('vipps.client_id'),
                "client_secret" => \Config::get('vipps.client_secret'),
                "Ocp-Apim-Subscription-Key" => \Config::get('vipps.subscription_key'),
            ],
        ]);

        $body = json_decode($response->getBody(), true);

        return $body["access_token"];
    }

    private function getVippsCheckoutHeaders()
    {
        return [
            "Merchant-Serial-Number" => \Config::get('vipps.merchant_id'),
            "client_id" => \Config::get('vipps.client_id'),
            "client_secret" => \Config::get('vipps.client_secret'),
            "Ocp-Apim-Subscription-Key" => \Config::get('vipps.subscription_key'),
            "Vipps-System-Name" => "ukabillett",
            "Vipps-System-Version" => "main",
            "Vipps-System-Plugin-Name" => "ukabillett",
            "Vipps-System-Plugin-Version" => "main",
        ];
    }
}
