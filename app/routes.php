<?php

Route::get('/api/events/get_upcoming', 'EventsController@getUpcoming');

Route::get('/api/event/{id_or_alias}', 'EventsController@getEvent');

// catch-all route
// TODO: this should probably be changed due to search engines not getting 404
Route::get('{slug?}', function()
{
	return View::make('template');
})->where('slug', '.+');