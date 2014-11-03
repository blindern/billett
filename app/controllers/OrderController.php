<?php

use Blindern\UKA\Billett\Order;

class OrderController extends \Controller {
    /**
     * We only grant access to orders we own
     */
    public function show($id) {
        $order = Order::find($id);
        if (!$order->isOwnerOfReservation) {
            return \Response::json('not found', 404);
        }

        $order->load('tickets');
        $order->load('payments');

        return $order;
    }

    /**
     * Update fields of reservation
     */
    public function update($id) {
        $order = Order::find($id);
        if (!$order->isOwnerOfReservation()) {
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
        if (!$order->isOwnerOfReservation()) {
            return \Response::json('not found', 404);
        }
        
        if (!$order->isReservation()) {
            return \Response::json('not a reservation', 400);
        }

        $order->deleteReservation();
        return Response::json(array('result' => 'deleted'));
    }
}