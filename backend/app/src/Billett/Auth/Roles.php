<?php

namespace Blindern\UKA\Billett\Auth;

use Illuminate\Support\Facades\Auth;

class Roles
{
    /**
     * Check if is admin.
     */
    public static function isAdmin(): bool
    {
        $user = Auth::user();
        if (!$user) return false;
        return in_array("ukabillettadmin", explode(",", $user->groups));
    }
}
