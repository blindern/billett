<?php

use App\Http\Controllers\DaythemeController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\EventgroupController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PaymentgroupController;
use App\Http\Controllers\PaymentsourceController;
use App\Http\Controllers\PrinterController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\TicketgroupController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VippsController;
use Blindern\UKA\Saml2\Saml2Controller;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Route;

// daytheme
Route::resource('/daytheme', DaythemeController::class, [
    'only' => ['index', 'show', 'store', 'update'],
]);

// eventgroup
Route::resource('/eventgroup', EventgroupController::class, [
    'only' => ['index', 'show', 'store', 'update'],
]);
Route::get('/eventgroup/{id}/simple', [EventgroupController::class, 'simpleList']);
Route::get('/eventgroup/{id}/sold_tickets_stats', [EventgroupController::class, 'soldTicketsStats']);
Route::get('/eventgroup/{id}/recruiters', [EventgroupController::class, 'recruiterList']);

// orders
Route::get('/order/fixbalance', [OrderController::class, 'fixbalance']);
Route::post('/order/{id}/place', [OrderController::class, 'placeOrder']);
Route::post('/order/{id}/force', [OrderController::class, 'forceOrder']);
Route::get('/order/receipt', [OrderController::class, 'receipt']);
Route::post('/order/{id}/create_tickets', [OrderController::class, 'createTickets']);
Route::post('/order/{id}/validate', [OrderController::class, 'validate']);
Route::post('/order/{id}/email', [OrderController::class, 'email']);
Route::resource('/order', OrderController::class, [
    'only' => ['index', 'show', 'store', 'update', 'destroy'],
]);

Route::post('/event/{id}/createreservation', [EventController::class, 'createReservation']);
Route::post('/event/{id}/ticketgroups_order', [EventController::class, 'ticketgroupsSetOrder']);
Route::get('/event/get_upcoming', [EventController::class, 'getUpcoming']);
Route::get('/event/{id}/image', [EventController::class, 'image']);
Route::post('/event/{id}/image', [EventController::class, 'uploadImage']);
Route::resource('/event', EventController::class, [
    'only' => ['show', 'store', 'update', 'destroy'],
]);

Route::get('/ticketgroup/{id}/previewticket', [TicketgroupController::class, 'previewTicket']);
Route::post('/ticketgroup/{id}/previewticket/print/{printername}', [TicketgroupController::class, 'previewTicketPrint']);
Route::resource('/ticketgroup', TicketgroupController::class, [
    'only' => ['index', 'show', 'store', 'update', 'destroy'],
]);

// tickets
Route::get('/ticket/pdf', [TicketController::class, 'mergedPdf']);
Route::post('/ticket/print/{printername}', [TicketController::class, 'printMergedPdf']);
Route::get('/ticket/{id}/pdf', [TicketController::class, 'pdf']);
Route::post('/ticket/{id}/print/{printername}', [TicketController::class, 'printTicket']);
Route::post('/ticket/{id}/revoke', [TicketController::class, 'revoke']);
Route::post('/ticket/{id}/validate', [TicketController::class, 'validate']);
Route::post('/ticket/{id}/checkin', [TicketController::class, 'checkin']);
Route::post('/ticket/{id}/checkout', [TicketController::class, 'checkout']);
Route::resource('/ticket', TicketController::class, [
    'only' => ['index', 'destroy'],
]);

// payments
Route::resource('/payment', PaymentController::class, [
    'only' => ['index', 'store'],
]);

// Vipps
Route::get('/vipps/order-return/{orderId}', [VippsController::class, 'returnUrl']);
Route::post('/vipps/callback', [VippsController::class, 'callback']);

// paymentgroups
Route::resource('/paymentgroup', PaymentgroupController::class, [
    'only' => ['index', 'show', 'store', 'update'],
]);
Route::post('/paymentgroup/{id}/close', [PaymentgroupController::class, 'close']);

// paymentsources
Route::resource('/paymentsource', PaymentsourceController::class, [
    'only' => ['index', 'show', 'store', 'update', 'destroy'],
]);

// printer handling
Route::get('/printer', [PrinterController::class, 'index']);
Route::post('/printer/announce', [PrinterController::class, 'printerAnnounce']);
Route::post('/printer/{printername}/text', [PrinterController::class, 'printText']);

/*Route::get('/email', function() {
    $order = Blindern\UKA\Billett\Order::findOrFail(Request::get('id'));
    $order->sendEmail();
    var_dump($order->name);
    die;
});*/

// saml2 login
Route::get('saml2/metadata', [Saml2Controller::class, 'metadata'])->name('saml2.metadata');
Route::post('saml2/acs', [Saml2Controller::class, 'acs'])->name('saml2.acs');
Route::get('saml2/sls', [Saml2Controller::class, 'sls'])->name('saml2.sls');
Route::get('saml2/login', [Saml2Controller::class, 'login'])->name('saml2.login');
Route::post('saml2/logout', [Saml2Controller::class, 'logout'])->name('saml2.logout');

// login details
Route::get('/me', [UserController::class, 'me']);

// catch-all route
Route::get('{slug?}', function () {
    return Response::json('not found', 404);
});
