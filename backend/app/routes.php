<?php

Route::when('*', 'csrf', ['delete', 'patch', 'post', 'put']);

// daytheme
Route::resource('/api/daytheme', 'DaythemeController', [
    'only' => ['index', 'show', 'store', 'update'],
]);

// eventgroup
Route::resource('/api/eventgroup', 'EventgroupController', [
    'only' => ['index', 'show', 'store', 'update'],
]);
Route::get('/api/eventgroup/{id}/simple', 'EventgroupController@simpleList');
Route::get('/api/eventgroup/{id}/sold_tickets_stats', 'EventgroupController@soldTicketsStats');
Route::get('/api/eventgroup/{id}/recruiters', 'EventgroupController@recruiterList');

// orders
Route::get('/api/order/fixbalance', 'OrderController@fixbalance');
Route::post('/api/order/{id}/place', 'OrderController@placeOrder');
Route::post('/api/order/{id}/force', 'OrderController@forceOrder');
Route::get('/api/order/receipt', 'OrderController@receipt');
Route::post('/api/order/{id}/create_tickets', 'OrderController@createTickets');
Route::post('/api/order/{id}/validate', 'OrderController@validate');
Route::post('/api/order/{id}/email', 'OrderController@email');
Route::resource('/api/order', 'OrderController', [
    'only' => ['index', 'show', 'store', 'update', 'destroy'],
]);

Route::post('/api/event/{id}/createreservation', 'EventController@createReservation');
Route::post('/api/event/{id}/ticketgroups_order', 'EventController@ticketgroupsSetOrder');
Route::get('/api/event/get_upcoming', 'EventController@getUpcoming');
Route::get('/api/event/{id}/image', 'EventController@image');
Route::post('/api/event/{id}/image', 'EventController@uploadImage');
Route::resource('/api/event', 'EventController', [
    'only' => ['show', 'store', 'update', 'destroy'],
]);

Route::get('/api/ticketgroup/{id}/previewticket', 'TicketgroupController@previewTicket');
Route::post('/api/ticketgroup/{id}/previewticket/print/{printername}', 'TicketgroupController@previewTicketPrint');
Route::resource('/api/ticketgroup', 'TicketgroupController', [
    'only' => ['index', 'show', 'store', 'update', 'destroy'],
]);

// tickets
Route::get('/api/ticket/pdf', 'TicketController@mergedPdf');
Route::post('/api/ticket/print/{printername}', 'TicketController@printMergedPdf');
Route::get('/api/ticket/{id}/pdf', 'TicketController@pdf');
Route::post('/api/ticket/{id}/print/{printername}', 'TicketController@printTicket');
Route::post('/api/ticket/{id}/revoke', 'TicketController@revoke');
Route::post('/api/ticket/{id}/validate', 'TicketController@validate');
Route::post('/api/ticket/{id}/checkin', 'TicketController@checkin');
Route::post('/api/ticket/{id}/checkout', 'TicketController@checkout');
Route::resource('/api/ticket', 'TicketController', [
    'only' => ['index', 'destroy'],
]);

// payments
Route::resource('/api/payment', 'PaymentController', [
    'only' => ['index', 'store'],
]);

// Vipps
Route::get('/api/vipps/order-return/{orderId}', 'VippsController@returnUrl');
Route::post('/api/vipps/callback', 'VippsController@callback');

// paymentgroups
Route::resource('/api/paymentgroup', 'PaymentgroupController', [
    'only' => ['index', 'show', 'store', 'update'],
]);
Route::post('/api/paymentgroup/{id}/close', 'PaymentgroupController@close');

// paymentsources
Route::resource('/api/paymentsource', 'PaymentsourceController', [
    'only' => ['index', 'show', 'store', 'update', 'destroy'],
]);

// printer handling
Route::get('/api/printer', 'PrinterController@index');
Route::post('/api/printer/announce', 'PrinterController@printerAnnounce');
Route::post('/api/printer/{printername}/text', 'PrinterController@printText');

/*Route::get('/email', function() {
    $order = Blindern\UKA\Billett\Order::findOrFail(\Request::get('id'));
    $order->sendEmail();
    var_dump($order->name);
    die;
});*/

// login details
Route::get('/api/me', 'UserController@me');

// catch-all route
Route::get('{slug?}', function () {
    return Response::json('not found', 404);
});
