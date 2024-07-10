<?php

use Blindern\UKA\Billett\Eventgroup;
use Blindern\UKA\Billett\Helpers\DuplicateSessionException;
use Blindern\UKA\Billett\Helpers\ModelHelper;
use Blindern\UKA\Billett\Helpers\VippsPaymentModule;
use Blindern\UKA\Billett\Order;
use Blindern\UKA\Billett\Payment;
use Blindern\UKA\Billett\Paymentgroup;
use Blindern\UKA\Billett\Ticketgroup;
use Henrist\LaravelApiQuery\Facades\ApiQuery;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    public function __construct()
    {
        $this->beforeFilter('auth', [
            'except' => [
                'show',
                'update',
                'destroy',
                'placeOrder',
                'forceOrder',
                'receipt',
            ],
        ]);
    }

    public function index()
    {
        return ApiQuery::processCollection(Order::where(function ($query) {
            $query->where('is_valid', true)->orWhere('is_admin', true);
        }));
    }

    /**
     * We only grant access to orders we own
     */
    public function show($id)
    {
        $class = ModelHelper::getModelPath('Order');
        $order = $class::find($id);
        if (! $order || (! $order->isOwnerOfReservation() && ! Auth::hasRole('billett.admin'))) {
            return Response::json('not found', 404);
        }

        if ($order->isReservation()) {
            if (! $order->renew()) {
                return Response::json('reservation expired', 404);
            }
        }

        $order->load('eventgroup');
        $order->load('tickets.ticketgroup', 'tickets.event');
        $order->load('payments.paymentgroup');

        return $order;
    }

    /**
     * Create a new manual reservation
     */
    public function store()
    {
        $fields = [
            'eventgroup_id' => 'required|integer',
            'name' => '',
            'email' => '',
            'phone' => '',
            'recruiter' => '',
            'comment' => '',
        ];
        $validator = Validator::make(Request::all(), $fields);

        if ($validator->fails()) {
            return Response::json('data validation failed', 400);
        }

        $eg = Eventgroup::findOrFail(Request::get('eventgroup_id'));
        $order = Order::createReservation($eg, true);

        unset($fields['eventgroup_id']);
        foreach (array_keys($fields) as $field) {
            if (Request::exists($field)) {
                $order->$field = Request::get($field);
            }
        }

        $order->save();

        $order->load('eventgroup');
        $order->load('tickets.ticketgroup', 'tickets.event');
        $order->load('payments.paymentgroup');

        return $order;
    }

    /**
     * Update fields of reservation
     */
    public function update($id)
    {
        $class = ModelHelper::getModelPath('Order');
        $order = $class::find($id);
        if (! $order || (! $order->isOwnerOfReservation() && ! Auth::hasRole('billett.admin'))) {
            return Response::json('not found', 404);
        }

        if (! $order->isReservation() && ! Auth::hasRole('billett.admin')) {
            return Response::json('not a reservation', 400);
        }

        $fields = $order->is_admin
            ? [
                'name' => '',
                'email' => '',
                'phone' => '',
                'recruiter' => '',
                'comment' => '']
            : [
                'name' => 'min:3',
                'email' => 'email',
                'phone' => 'regex:/\\+?\\d+/',
                'recruiter' => ''];

        $validator = Validator::make(Request::all(), $fields);

        if ($validator->fails()) {
            return Response::json('data validation failed', 400);
        }

        // With Vipps these are only sent in admin site.
        if (Request::exists('name')) {
            $order->name = Request::get('name');
            $order->email = Request::get('email');
            $order->phone = Request::get('phone');
        }

        $order->recruiter = Request::get('recruiter');

        if (Auth::hasRole('billett.admin') && Request::exists('comment')) {
            $order->comment = Request::get('comment');
        }

        $order->save();

        $order->load('eventgroup');
        $order->load('tickets.ticketgroup', 'tickets.event');
        $order->load('payments.paymentgroup');

        return $order;
    }

    /**
     * Delete reservation
     */
    public function destroy($id)
    {
        $order = Order::find($id);
        if (! $order || (! $order->isOwnerOfReservation() && ! Auth::hasRole('billett.admin'))) {
            return Response::json('not found', 404);
        }

        if (! $order->isReservation()) {
            return Response::json('not a reservation', 400);
        }

        $order->deleteReservation();

        return Response::json(['result' => 'deleted']);
    }

    /**
     * Place a order (send it to payment)
     */
    public function placeOrder($id)
    {
        $order = Order::find($id);
        if (! $order || (! $order->isOwnerOfReservation() && ! Auth::hasRole('billett.admin'))) {
            return Response::json('not found', 404);
        }

        if (! $order->isReservation()) {
            return Response::json('not a reservation', 400);
        }

        if (! $order->placeOrder()) {
            return Response::json('invalid state', 400);
        }

        $vipps = new VippsPaymentModule;

        try {
            $sessionDetails = $vipps->initiateSession($order);
        } catch (DuplicateSessionException $e) {
            return Response::json('Reservasjonen må avbrytes og startes på nytt', 400);
        }

        return [
            'checkoutFrontendUrl' => $sessionDetails['checkoutFrontendUrl'],
            'token' => $sessionDetails['token'],
        ];
    }

    /**
     * Pretend the payment succeeds
     */
    public function forceOrder($id)
    {
        if (! Config::get('vipps.test')) {
            throw new \Exception('Only available in test mode');
        }

        $order = Order::find($id);
        if (! $order || ! $order->isOwnerOfReservation()) {
            return Response::json('not found', 404);
        }

        if (! $order->isReservation()) {
            return Response::json('not a reservation', 400);
        }

        if (! $order->placeOrder()) {
            return Response::json('invalid state', 400);
        }

        // TODO: implement
        exit('Not implemented for Vipps');

        /*
        $vipps = new VippsPaymentModule;

        $payment = $vipps->processFeedback($order, $data);

        $order->load('tickets.ticketgroup', 'tickets.event');
        unset($payment->order);

        Session::put('order_receipt', array(
            'order' => $order,
            'payment' => $payment
        ));

        return 'OK';
        */
    }

    /**
     * Get receipt details for previous completed order
     */
    public function receipt()
    {
        // In case the user refreshes the page we still want
        // to show the completed order. This is why we don't
        // delete the receipt. It will be overwritten if there
        // is a new order completed.

        $ret = Session::get('order_receipt', null);
        if (! $ret) {
            return Response::json('no receipt exists', 404);
        }

        return $ret;
    }

    /**
     * Create tickets for a order
     *
     * Params:
     * - ticketgroups: {ticketgroup_id: count, ..} list of ticketgroups and number tickets to add
     *
     * Returns:
     * - New tickets
     */
    public function createTickets($order_id)
    {
        $order = Order::findOrFail($order_id);

        $list = Request::get('ticketgroups');
        $validate = function ($list) {
            if (! is_array($list)) {
                return false;
            }
            foreach ($list as $id => $count) {
                if (filter_var($id, FILTER_VALIDATE_INT) === false || filter_var($count, FILTER_VALIDATE_INT) === false || $count < 0) {
                    return false;
                }
            }

            return true;
        };
        if (! $validate($list)) {
            return Response::json('data validation failed', 400);
        }

        $ticketgroups = Ticketgroup::with('event')->find(array_keys($list));
        if (count($ticketgroups) != count($list)) {
            return Response::json('not all ticketgroups found', 400);
        }

        $grouplist = [];
        foreach ($ticketgroups as $ticketgroup) {
            $grouplist[] = [$ticketgroup, $list[$ticketgroup->id]];
        }

        if (! Request::has('ignore_limits')) {
            if (! Ticketgroup::checkIsAvailable($grouplist)) {
                return Response::json('tickets not available', 400);
            }
        }

        return $order->createTickets($grouplist);
    }

    /**
     * Mark order as completed/valid (converts from reservation to actual order)
     *
     * Params:
     * - paymentgroup: id of paymentgroup (will not convert tickets if not given)
     * - amount: amount that should be the same as the tickets that will be validated (will reject if not)
     * - sendmail: whether to send email when validated
     */
    public function validate($id)
    {
        $order = Order::with('tickets.ticketgroup')->findOrFail($id);

        if ($order->isCompleted()) {
            return Response::json('order is already complete', 400);
        }

        $skip_tickets = true;
        $paymentgroup = null;
        $sum = 0;
        if (Request::has('paymentgroup')) {
            $paymentgroup = Paymentgroup::findOrFail(Request::get('paymentgroup'));
            $skip_tickets = false;

            if (! Request::exists('amount')) {
                return Response::json('missing amount', 400);
            }

            foreach ($order->tickets as $ticket) {
                if (! $ticket->is_valid) {
                    $sum += $ticket->ticketgroup->price + $ticket->ticketgroup->fee;
                }
            }

            if ($sum != Request::get('amount')) {
                return Response::json('amount mismatched', 400);
            }
        }

        if (! $order->markComplete($skip_tickets, $paymentgroup)) {
            return Response::json('could not convert from reservation to order, renew reservation failed', 400);
        }

        if ($paymentgroup && $sum > 0) {
            $payment = new Payment;
            $payment->order()->associate($order);
            $payment->paymentgroup()->associate($paymentgroup);
            $payment->time = time();
            $payment->user_created = Auth::user()->username;
            $payment->is_web = false;
            $payment->amount = (float) $sum;
            $payment->save();

            $order->modifyBalance($payment->amount);
        }

        if (Request::get('sendmail') && $order->email) {
            $order->sendEmail();
        }

        // remove ticket's order (backreference needed for setValid and order's balance sync)
        foreach ($order->tickets as $ticket) {
            unset($ticket->order);
        }

        return $order;
    }

    /**
     * Send email copy
     */
    public function email($id)
    {
        $order = Order::findOrFail($id);

        // manual email?
        $email = null;
        if (Request::has('email')) {
            $email = Request::get('email');
        }

        $order->sendEmail($email, Request::get('text'));

        return Response::json('email sent');
    }

    /**
     * Force refresh of order balances in case they are out of sync
     */
    public function fixbalance()
    {
        Order::refreshBalances();

        return Response::json('balances refreshed');
    }
}
