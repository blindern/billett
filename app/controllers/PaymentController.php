<?php

use Blindern\UKA\Billett\Payment;
use Blindern\UKA\Billett\Paymentgroup;
use Blindern\UKA\Billett\Order;

class PaymentController extends \Controller {
    public function __construct()
    {
        $this->beforeFilter('auth');
    }

    public function index()
    {
        return \ApiQuery::processCollection(Payment::query());
    }

    /**
     * Register new payment
     */
    public function store()
    {
        $fields = [
            'order_id' => 'required|integer',
            'paymentgroup_id' => 'required|integer',
            'amount' => 'required|numeric'
        ];
        $validator = \Validator::make(Input::all(), $fields);

        if ($validator->fails()) {
            return \Response::json('data validation failed', 400);
        }

        $order = Order::findOrFail(Input::get('order_id'));
        $paymentgroup = Paymentgroup::findOrFail(Input::get('paymentgroup_id'));

        if ($paymentgroup->eventgroup_id != $order->eventgroup_id) {
            return Response::json('paymentgroup and order not in same eventgroup', 400);
        }

        if ($paymentgroup->time_end) {
            return Response::json('paymentgroup is closed', 400);
        }

        $payment = new Payment;
        $payment->order()->associate($order);
        $payment->paymentgroup()->associate($paymentgroup);
        $payment->time = time();
        $payment->is_web = false;
        $payment->amount = (float) Input::get('amount');
        $payment->save();

        $order->modifyBalance($payment->amount);
        return $payment;
    }
}
