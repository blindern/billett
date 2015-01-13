<?php

use Blindern\UKA\Billett\Eventgroup;
use Blindern\UKA\Billett\Order;
use Blindern\UKA\Billett\Ticketgroup;
use Blindern\UKA\Billett\Helpers\DibsPaymentModule;
use Blindern\UKA\Billett\Helpers\ModelHelper;

class OrderController extends \Controller {
    public function __construct() {
        $this->beforeFilter('auth', [
            'except' => [
                'show',
                'update',
                'destroy',
                'placeOrder',
                'forceOrder'
            ]
        ]);
    }

    public function index() {
        return \ApiQuery::processCollection(Order::where('is_valid', true));
    }

    /**
     * We only grant access to orders we own
     */
    public function show($id) {
        $class = ModelHelper::getModelPath('Order');
        $order = $class::find($id);
        if (!$order || (!$order->isOwnerOfReservation() && !\Auth::hasRole('billett.admin'))) {
            return \Response::json('not found', 404);
        }

        if ($order->isReservation()) {
            if (!$order->renew()) {
                return \Response::json('reservation expired', 404);
            }
        }

        $order->load('tickets.ticketgroup', 'tickets.event');
        $order->load('payments');

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
            'comment' => ''
        ];
        $validator = \Validator::make(Input::all(), $fields);

        if ($validator->fails()) {
            return \Response::json('data validation failed', 400);
        }

        $eg = Eventgroup::findOrFail(Input::get('eventgroup_id'));
        $order = Order::createReservation($eg, true);

        unset($fields['eventgroup_id']);
        foreach (array_keys($fields) as $field) {
            if (Input::exists($field)) {
                $order->$field = Input::get($field);
            }
        }

        $order->save();
        return $order;
    }

    /**
     * Update fields of reservation
     */
    public function update($id) {
        $class = ModelHelper::getModelPath('Order');
        $order = $class::find($id);
        if (!$order || (!$order->isOwnerOfReservation() && !\Auth::hasRole('billett.admin'))) {
            return \Response::json('not found', 404);
        }

        if (!$order->isReservation()) {
            return \Response::json('not a reservation', 400);
        }

        $fields = $order->is_admin
            ? [
                'name' => '',
                'email' => '',
                'phone' => '',
                'recruiter' => '',
                'comment' => '']
            : [
                'name' => 'required|min:3',
                'email' => 'required|email',
                'phone' => 'required|regex:/\\+?\\d+/',
                'recruiter' => ''];

        $validator = \Validator::make(Input::all(), $fields);

        if ($validator->fails()) {
            return \Response::json('data validation failed', 400);
        }

        $order->name = Input::get('name');
        $order->email = Input::get('email');
        $order->phone = Input::get('phone');
        $order->recruiter = Input::get('recruiter');

        if (\Auth::hasRole('billett.admin') && Input::exists('comment')) {
            $order->comment = Input::get('comment');
        }

        $order->save();
        return $order;
    }

    /**
     * Delete reservation
     */
    public function destroy($id) {
        $order = Order::find($id);
        if (!$order || (!$order->isOwnerOfReservation() && !\Auth::hasRole('billett.admin'))) {
            return \Response::json('not found', 404);
        }

        if (!$order->isReservation()) {
            return \Response::json('not a reservation', 400);
        }

        $order->deleteReservation();
        return Response::json(array('result' => 'deleted'));
    }

    /**
     * Place a order (send it to payment)
     */
    public function placeOrder($id) {
        $order = Order::find($id);
        if (!$order || (!$order->isOwnerOfReservation() && !\Auth::hasRole('billett.admin'))) {
            return \Response::json('not found', 404);
        }

        if (!$order->isReservation()) {
            return \Response::json('not a reservation', 400);
        }

        if (!$order->placeOrder()) {
            return \Response::json('invalid state', 400);
        }

        $dibs = new DibsPaymentModule;

        return array(
            'url' => $dibs->getCheckoutUrl(),
            'fields' => $dibs->generateCheckoutFields($order)
        );
    }

    /**
     * Pretend the payment succeeds
     */
    public function forceOrder($id) {
        if (!\Config::get('dibs.test')) {
            throw new \Exception("Only available in test mode");
        }

        $order = Order::find($id);
        if (!$order || !$order->isOwnerOfReservation()) {
            return \Response::json('not found', 404);
        }

        if (!$order->isReservation()) {
            return \Response::json('not a reservation', 400);
        }

        if (!$order->placeOrder()) {
            return \Response::json('invalid state', 400);
        }

        $data = array(
            'status' => 'ACCEPTED',
            'transaction' => 123,
            'amount' => $order->total_amount*100,
        );

        $dibs = new DibsPaymentModule;
        $payment = $dibs->processFeedback($order, $data);

        $order->load('tickets.ticketgroup', 'tickets.event');
        unset($payment->order);
        return array(
            'order_receipt' => array(
                'order' => $order,
                'payment' => $payment
            )
        );
    }

    /**
     * Create tickets for a order
     */
    public function createTickets($order_id)
    {
        $order = Order::findOrFail($order_id);

        $list = Input::get('paymentgroups');
        $validate = function ($list) {
            if (!is_array($list)) return false;
            foreach ($list as $id => $count) {
                if (filter_var($id, FILTER_VALIDATE_INT) === false || filter_var($count, FILTER_VALIDATE_INT) === false || $count < 0) return false;
            }
            return true;
        };
        if (!$validate($list)) {
            return \Response::json('data validation failed', 400);
        }

        $ticketgroups = Ticketgroup::with('event')->find(array_keys($list));
        if (count($ticketgroups) != count($list)) {
            return \Response::json('not all ticketgroups found', 400);
        }

        $grouplist = [];
        foreach ($ticketgroups as $ticketgroup) {
            $grouplist[] = [$ticketgroup, $list[$ticketgroup->id]];
        }

        if (!Input::has('ignore_limits')) {
            if (!Ticketgroup::checkIsAvailable($grouplist)) {
                return \Response::json('tickets not available', 400);
            }
        }

        return $order->createTickets($grouplist);
    }
}