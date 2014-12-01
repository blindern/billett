<?php

Route::resource('/api/eventgroup', 'EventgroupController', array(
	'only' => array('index', 'show')
));

Route::post('/api/order/{id}/place', 'OrderController@placeOrder');
Route::resource('/api/order', 'OrderController', array(
    'only' => array('show', 'update', 'destroy')
));

Route::post('/api/event/{id}/createreservation', 'EventController@createReservation');
Route::get('/api/event/get_upcoming', 'EventController@getUpcoming');
Route::resource('/api/event', 'EventController', array(
	'only' => array('show', 'store', 'update', 'destroy')
));

Route::resource('/api/ticketgroup', 'TicketgroupController', array(
    'only' => array('index', 'show', 'store', 'update', 'destroy')
));


Route::get('/event/{id}/image', 'EventController@image');
Route::post('/event/{id}/image', 'EventController@uploadImage');


// payment (callback)
Route::post('/dibs/cancel', 'DibsController@cancel');
Route::post('/dibs/callback', 'DibsController@callback');
Route::post('/dibs/accept', 'DibsController@accept');


Route::get('/pdf', function() {
    $ticket = Blindern\UKA\Billett\Ticket::findOrFail(\Input::get('id'));
    return Response::make($ticket->getPdfData(), 200, array(
        'Content-Type' => 'application/pdf',
        'Content-Disposition' => 'inline; filename="'.$ticket->getPdfName().'"'
    ));
});

Route::get('/email', function() {
    $order = Blindern\UKA\Billett\Order::findOrFail(\Input::get('id'));
    $order->sendEmail();
    var_dump($order->name);
    die;
});

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