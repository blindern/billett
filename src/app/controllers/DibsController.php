<?php

use Blindern\UKA\Billett\Helpers\DibsPaymentModule;
use Blindern\UKA\Billett\Helpers\ModelHelper;
use Blindern\UKA\Billett\Order;
use Blindern\UKA\Billett\Payment;

class DibsController extends Controller {
    private $dibs;

    public function cancel()
    {
        $order = $this->getOrderAndValidate();

        return Redirect::to('event/'.$order->tickets[0]->event->id);
    }

    public function callback()
    {
        return $this->accept(true);
    }

    public function accept($by_callback = false)
    {
        try {
            $order = $this->getOrderAndValidate();
        } catch (\ModelNotFoundException $e) {
            // if this case happens, the order did exist some time but has been deleted
            // the order cannot be succeeded, so we should store the information
            // and manually process it later

            // if not accepted, we can silently ignore
            if (\Input::get('status') != 'ACCEPTED') {
                if ($by_callback) die;
                return \Redirect::to('');
            }

            Log::alert('Order not found but processed: '.json_encode($_POST));
            Mail::send(array('text' => 'billett.email_payment_order_404'), $_POST, function($message)
            {
                $message->to(\Config::get('dibs.email_reports'));
                $message->subject('Betalingsskjema fullført på slettet ordre');
            });

            die('Du har fullført en betaling for en ordre som ikke eksisterer. Dette er rapportert til de ansvarlige og vil bli fulgt opp.');
        }

        $payment = $this->dibs->processFeedback($order, $_POST);

        if ($by_callback) die;

        $order->load('tickets.ticketgroup', 'tickets.event');
        unset($payment->order);

        Session::put('order_receipt',
            'order' => $order,
            'payment' => $payment
        );

        return Redirect::to('order/completed');
    }

    private function getOrderAndValidate()
    {
        $this->dibs = new DibsPaymentModule;

        $class = ModelHelper::getModelPath('Order');
        $order = $class::findByTextIdOrFail(\Input::get('orderId'));

        if (!\Input::has('MAC'))
        {
            throw new \Exception("Missing MAC");
        }

        // kontroller HMAC
        $params = $_POST;
        unset($params['MAC']);

        $key = $this->dibs->generateHmacHash($params);
        if ($key != \Input::get('MAC'))
        {
            throw new \Exception("MAC verification failed");
        }

        return $order;
    }
}
