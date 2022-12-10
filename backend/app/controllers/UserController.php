<?php

class UserController extends Controller
{
    public function me()
    {
        $user = Auth::check() ? Auth::user() : null;
        $is_dev = (bool)\Config::get('app.dev');

        return [
            'logged_in' => (bool) $user,
            'user_roles' => Auth::getRoles(),
            'user' => $user,
            'is_dev' => $is_dev,
            'is_vipps_test' => \Config::get('vipps.test'),
            'csrf_token' => Session::token(),
        ];
    }
}
