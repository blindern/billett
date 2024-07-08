<?php

use Illuminate\Database\Eloquent\ModelNotFoundException;

/*
|--------------------------------------------------------------------------
| Application & Route Filters
|--------------------------------------------------------------------------
|
| Below you will find the "before" and "after" events for the application
| which may be used to do any work before or after a request into your
| application. Here you may also register your custom route filters.
|
*/

App::before(function ($request) {
    //
});

App::after(function ($request, $response) {
    // cors for development version of frontend
    if (isset($_SERVER['HTTP_REFERER']) && strpos($_SERVER['HTTP_REFERER'], 'localhost:3000') !== false) {
        $response->headers->set('Access-Control-Allow-Origin', 'http://localhost:3000');
        $response->headers->set('Access-Control-Allow-Credentials', 'true');
        $response->headers->set('Access-Control-Allow-Headers', 'X-Requested-With,X-Csrf-Token,Content-Type');
        $response->headers->set('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,DELETE');
    }
});

// handle findOrFail-calls
App::error(function (ModelNotFoundException $e) {
    return Response::json('not found', 404);
});

App::missing(function ($exception) {
    return Response::json('not found', 404);
});

/*
|--------------------------------------------------------------------------
| Authentication Filters
|--------------------------------------------------------------------------
|
| The following filters are used to verify that the user of the current
| session is logged into this application. The "basic" filter easily
| integrates HTTP Basic authentication for quick, simple checking.
|
*/

Route::filter('auth', function () {
    if (Auth::guest()) {
        if (Request::ajax()) {
            return Response::make('Unauthorized', 401);
        } else {
            return Redirect::guest('login');
        }
    }
});

Route::filter('auth.basic', function () {
    return Auth::basic();
});

/*
|--------------------------------------------------------------------------
| Guest Filter
|--------------------------------------------------------------------------
|
| The "guest" filter is the counterpart of the authentication filters as
| it simply checks that the current user is not logged in. A redirect
| response will be issued if they are, which you may freely change.
|
*/

Route::filter('guest', function () {
    if (Auth::check()) {
        return Redirect::to('/');
    }
});

/*
|--------------------------------------------------------------------------
| CSRF Protection Filter
|--------------------------------------------------------------------------
|
| The CSRF filter is responsible for protecting your application against
| cross-site request forgery attacks. If this special token in a user
| session does not match the one given in this request, we'll bail.
|
*/

Route::filter('csrf', function ($route, $request) {
    // POST for Vipps form don't require csrf
    if (substr($request->path(), 0, 10) == 'api/vipps/') {
        return;
    }

    // POST for ticekt printer don't require csrf
    if (substr($request->path(), 0, 20) == 'api/printer/announce') {
        return;
    }

    if (Session::token() != Input::get('_token') && Session::token() != $request->header('X-Csrf-Token')) {
        throw new Illuminate\Session\TokenMismatchException;
    }
});
