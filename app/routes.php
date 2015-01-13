<?php

Route::when('*', 'csrf', ['delete', 'patch', 'post', 'put']);

// eventgroup
Route::resource('/api/eventgroup', 'EventgroupController', array(
    'only' => array('index', 'show')
));
Route::get('/api/eventgroup/{id}/simple', 'EventgroupController@simpleList');
Route::get('/api/eventgroup/{id}/sold_tickets_stats', 'EventgroupController@soldTicketsStats');

// orders
Route::post('/api/order/{id}/place', 'OrderController@placeOrder');
Route::post('/api/order/{id}/force', 'OrderController@forceOrder');
Route::post('/api/order/{id}/create_tickets', 'OrderController@createTickets');
Route::post('/api/order/{id}/validate', 'OrderController@validate');
Route::resource('/api/order', 'OrderController', array(
    'only' => array('index', 'show', 'store', 'update', 'destroy')
));

Route::post('/api/event/{id}/createreservation', 'EventController@createReservation');
Route::post('/api/event/{id}/ticketgroups_order', 'EventController@ticketgroupsSetOrder');
Route::get('/api/event/get_upcoming', 'EventController@getUpcoming');
Route::resource('/api/event', 'EventController', array(
    'only' => array('show', 'store', 'update', 'destroy')
));

Route::get('/api/ticketgroup/{id}/previewticket', 'TicketgroupController@previewTicket');
Route::resource('/api/ticketgroup', 'TicketgroupController', array(
    'only' => array('index', 'show', 'store', 'update', 'destroy')
));


Route::get('/event/{id}/image', 'EventController@image');
Route::post('/event/{id}/image', 'EventController@uploadImage');

// tickets
Route::get('/api/ticket/{id}/pdf', 'TicketController@pdf');
Route::post('/api/ticket/{id}/revoke', 'TicketController@revoke');
Route::post('/api/ticket/{id}/validate', 'TicketController@validate');
Route::resource('/api/ticket', 'TicketController', array(
    'only' => array('index', 'destroy')
));

// payments
Route::resource('/api/payment', 'PaymentController', array(
    'only' => array('index')
));

// payment (callback)
Route::post('/dibs/cancel', 'DibsController@cancel');
Route::post('/dibs/callback', 'DibsController@callback');
Route::post('/dibs/accept', 'DibsController@accept');

// paymentgroups
Route::resource('/api/paymentgroup', 'PaymentgroupController', array(
    'only' => array('index', 'show', 'store', 'update')
));
Route::post('/api/paymentgroup/{id}/close', 'PaymentgroupController@close');


/*Route::get('/email', function() {
    $order = Blindern\UKA\Billett\Order::findOrFail(\Input::get('id'));
    $order->sendEmail();
    var_dump($order->name);
    die;
});*/

// catch-all route
// TODO: this should probably be changed due to search engines not getting 404
Route::get('/api/{slug?}', function()
{
    return Response::json('not found', 404);
});
Route::get('{slug?}', function()
{
    return View::make('template');
})->where('slug', '.+');