<?php

use Blindern\UKA\Billett\Order;
use Blindern\UKA\Billett\Helpers\DibsPaymentModule;

class OrderController extends \Controller {
    /**
     * We only grant access to orders we own
     */
    public function show($id) {
        $order = Order::find($id);
        if (!$order || !$order->isOwnerOfReservation()) {
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
     * Update fields of reservation
     */
    public function update($id) {
        $order = Order::find($id);
        if (!$order || !$order->isOwnerOfReservation()) {
            return \Response::json('not found', 404);
        }

        if (!$order->isReservation()) {
            return \Response::json('not a reservation', 400);
        }

        $validator = \Validator::make(Input::all(), array(
            'name' => 'required|min:3',
            'email' => 'required|email',
            'phone' => 'required|regex:/\\+?\\d+/'
        ));

        if ($validator->fails()) {
            return \Response::json('data validation failed', 400);
        }

        $order->name = Input::get('name');
        $order->email = Input::get('email');
        $order->phone = Input::get('phone');
        $order->save();

        return $order;
    }

    /**
     * Delete reservation
     */
    public function destroy($id) {
        $order = Order::find($id);
        if (!$order || !$order->isOwnerOfReservation()) {
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
        if (!$order || !$order->isOwnerOfReservation()) {
            return \Response::json('not found', 404);
        }

        if (!$order->isReservation()) {
            return \Response::json('not a reservation', 400);
        }

        if (!$order->placeOrder()) {
            return \Response::json('invalid state', 400);
        }

        $dibs = new DibsPaymentModule;

        // TODO: generate (redirect to) payment form
        return array(
            'url' => $dibs->getCheckoutUrl(),
            'fields' => $dibs->generateCheckoutFields($order)
        );
    }
}