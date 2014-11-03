<?php

Route::resource('/api/eventgroup', 'EventGroupController', array(
	'only' => array('index', 'show')
));

Route::post('/api/order/{id}/update', 'OrderController@updateReservation');
Route::resource('/api/order', 'OrderController', array(
    'only' => array('show', 'update', 'destroy')
));

Route::post('/api/event/{id}/createreservation', 'EventController@createReservation');
Route::get('/api/event/get_upcoming', 'EventController@getUpcoming');
Route::resource('/api/event', 'EventController', array(
	'only' => array('show')
));


// payment (callback)
Route::post('/payment', 'PaymentController@callback');


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