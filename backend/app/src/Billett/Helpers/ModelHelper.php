<?php

namespace Blindern\UKA\Billett\Helpers;

use Illuminate\Support\Facades\Request;

class ModelHelper
{
    public static function getModelPath($name)
    {
        $guest = 'Guest';

        if (Request::has('admin') && Auth::hasRole('billett.admin')) {
            $guest = '';
        }

        $class = '\\Blindern\\UKA\\Billett\\'.$name.$guest;

        return $class;
    }
}
