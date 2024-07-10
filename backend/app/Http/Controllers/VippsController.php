<?php

namespace App\Http\Controllers;

use Blindern\UKA\Billett\Helpers\ModelHelper;
use Blindern\UKA\Billett\Helpers\VippsPaymentModule;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Session;

class VippsController extends Controller
{
    public function returnUrl($orderId)
    {
        $class = ModelHelper::getModelPath('Order');
        $order = $class::find($orderId);
        if (! $order || ! $order->isOwnerOfReservation()) {
            return Response::json('not found', 404);
        }

        $vipps = new VippsPaymentModule;

        $payment = $vipps->checkForPayment($order);

        if ($payment) {
            $order->load('tickets.ticketgroup', 'tickets.event');
            unset($payment->order);

            Session::put('order_receipt', [
                'order' => $order,
                'payment' => $payment,
            ]);

            return Redirect::to('order/complete');
        } else {
            return Redirect::to('event/'.$order->tickets()->with('event')->get()[0]->event->id);
        }
    }

    public function callback()
    {
        $vipps = new VippsPaymentModule;

        Log::info('Vipps callback data: '.json_encode(Request::all()));

        try {
            $class = ModelHelper::getModelPath('Order');
            $order = $class::findByTextIdOrFail(Request::get('reference'));
        } catch (ModelNotFoundException $e) {
            // if this case happens, the order did exist some time but has been deleted
            // the order cannot be succeeded, so we should store the information
            // and manually process it later

            // if we forget to handle this, eventually the payment reservation
            // will expire and the user will not have paid for it

            // if not accepted, we can silently ignore
            if (Request::get('status') != 'PaymentSuccessful') {
                exit;
            }

            Log::alert('Order not found but processed: '.json_encode($_POST));
            Mail::send(['text' => 'billett.email_payment_order_404'], $_POST, function ($message) {
                $message->to(Config::get('vipps.email_reports'));
                $message->subject('Betalingsskjema fullført på slettet ordre');
            });

            exit('Du har fullført en betaling for en ordre som ikke eksisterer. Dette er rapportert til de ansvarlige og vil bli fulgt opp.');
        }

        $vipps->checkForPayment($order);

        return '';
    }
}
