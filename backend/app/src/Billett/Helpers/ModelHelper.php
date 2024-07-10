<?php

namespace Blindern\UKA\Billett\Helpers;

use Blindern\UKA\Billett\Auth\Roles;
use Illuminate\Support\Facades\Request;

class ModelHelper
{
    public static function getModelPath($name)
    {
        $guest = 'Guest';

        if (Request::has('admin') && Roles::hasRole('billett.admin')) {
            $guest = '';
        }

        $class = '\\Blindern\\UKA\\Billett\\'.$name.$guest;

        return $class;
    }
}
