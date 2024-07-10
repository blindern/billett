<?php

namespace App\Http\Controllers;

use Blindern\UKA\Billett\Order;
use Blindern\UKA\Billett\Payment;
use Blindern\UKA\Billett\Paymentgroup;
use Henrist\LaravelApiQuery\Facades\ApiQuery;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Validator;

class PaymentController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index()
    {
        return ApiQuery::processCollection(Payment::query());
    }

    /**
     * Register new payment
     */
    public function store()
    {
        $fields = [
            'order_id' => 'required|integer',
            'paymentgroup_id' => 'required|integer',
            'amount' => 'required|numeric|not_in:0',
        ];
        $validator = Validator::make(Request::all(), $fields);

        if ($validator->fails()) {
            return Response::json('data validation failed', 400);
        }

        $order = Order::findOrFail(Request::get('order_id'));
        $paymentgroup = Paymentgroup::findOrFail(Request::get('paymentgroup_id'));

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
        $payment->user_created = Auth::user()->username;
        $payment->is_web = false;
        $payment->amount = (float) Request::get('amount');
        $payment->save();

        $order->modifyBalance($payment->amount);

        return $payment;
    }
}
