<?php namespace Blindern\UKA\Billett\Helpers;

use \Blindern\UKA\Billett\Order;
use \Blindern\UKA\Billett\Payment;

class DibsPaymentModule {
    /**
     * Generate HMAC-hash
     */
    public function generateHmacHash($params)
    {
        ksort($params);

        $data = array();
        foreach ($params as $key => $value) {
            $data[] = $key."=".$value;
        }

        $data = implode("&", $data);
        return hash_hmac("sha256", $data, hex2bin(\Config::get('dibs.hmac_key')));
    }

    /**
     * Generate fields for checkout form
     */
    public function generateCheckoutFields(Order $order)
    {
        $order->load('tickets.ticketgroup', 'tickets.event');

        $amount = 0;
        foreach ($order->tickets as $ticket) {
            $amount += $ticket->ticketgroup->price + $ticket->ticketgroup->fee;
        }
        $amount *= 100;

        $params = array();
        $params['merchant'] = \Config::get('dibs.merchant_id');
        $params['orderId']  = $order->order_text_id;
        $params['language'] = 'no';

        if (\Config::get('dibs.capture'))
            $params['capturenow'] = 1;

        if (\Config::get('dibs.test'))
            $params['test'] = 1;

        $params['amount']           = $amount;
        $params['currency']         = \Config::get('dibs.currency_id');
        $params['language']         = \Config::get('dibs.language');
        $params['acceptReturnUrl']  = url('dibs/accept');
        $params['callbackUrl']      = url('dibs/callback');
        $params['cancelReturnUrl']  = url('dibs/cancel');

        $params['billingFirstName']   = $order->name;
        $params['billingEmail'] = $order->email;
        $params['oiTypes'] = 'ITEMID;DESCRIPTION;AMOUNT;QUANTITY;VATAMOUNT';

        $i = 0;
        foreach ($order->tickets as $ticket) {
            $date = \Carbon\Carbon::createFromTimeStamp($ticket->event->time_start);

            $params['oiRow'.(++$i)] = sprintf('%d;%s;%d;1;0',
                    $ticket->event->id,
                    str_replace(';', '\\;', $ticket->event->title.' ('.$date->format('Y-m-d H:i').'): '.$ticket->ticketgroup->title),
                    round(($ticket->ticketgroup->price+$ticket->ticketgroup->fee)*100));
        }

        $params['MAC'] = $this->generateHmacHash($params);
        return $params;
    }

    /**
     * Get URL for checkout
     */
    public function getCheckoutUrl()
    {
        return \Config::get('dibs.checkout_url');
    }

    /**
     * Process feedback from DIBS
     *
     * If the payment succeeded, the order will be marked complete and email sent
     *
     * Possible outcomes:
     * - Payment with status = DECLINED
     * - Payment with status = ACCEPTED
     *   - having invalid/valid order status depending if the tickets was made valid or not
     * - Payment with status = PENDING
     *
     * @return Payment
     */
    public function processFeedback(&$order, $data)
    {
        // make sure the order is locked when we process it here
        return \DB::transaction(function() use (&$order, $data) {
            \DB::table('orders')->where('id', $order->id)->lockForUpdate()->get();

            // fetch the order again to make sure we have fresh values
            // we overwrite the order that is sent to the method because the variable is referenced
            $class = ModelHelper::getModelPath('Order');
            $order = $class::findOrFail($order->id);

            // special callback for declined
            if ($data['status'] == 'DECLINED') {
                $payment = new Payment;
                $payment->order()->associate($order);
                $payment->type = 'web';
                $payment->time = time();
                $payment->amount = 0;
                $payment->status = $data['status'];
                $payment->data = json_encode(array('server' => $_SERVER, 'post' => $_POST));
                $payment->save();

                // TODO: send email if we had PENDING status?

                return $payment;
            }

            // status can now only be ACCEPTED and PENDING, and transaction_id will be supplied
            // make sure we have a record for the transaction
            $payment = $order->payments()->where('transaction_id', $data['transaction'])->first();
            if ($payment && $payment->status == 'ACCEPTED') {
                return $payment;
            }

            if (!$payment) {
                $payment = new Payment;
                $payment->order()->associate($order);
                $payment->type = 'web';
                $payment->transaction_id = $data['transaction'];
            }
            $payment->time = time();
            $payment->amount = $data['status'] == 'ACCEPTED' ? $data['amount']/100.0 : 0;
            $payment->status = $data['status'];
            $payment->data = json_encode(array('server' => $_SERVER, 'data' => $data));
            $payment->save();

            $order->time = time();

            if ($payment->status == 'ACCEPTED') {
                if (!$order->isReservation()) {
                    Log::alert('Order is not a reservation but payment registered');
                    die('Order is not a reservation but payment registered');
                }

                if ($order->markComplete()) {
                    // send the receipt
                    $order->sendEmail();
                }
            }

            $order->save();
            return $payment;
        });
    }
}
