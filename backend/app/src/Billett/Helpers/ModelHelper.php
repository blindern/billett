<?php

namespace Blindern\UKA\Billett\Helpers;

class ModelHelper
{
    public static function getModelPath($name)
    {
        $guest = 'Guest';

        if (\Request::has('admin') && \Auth::hasRole('billett.admin')) {
            $guest = '';
        }

        $class = '\\Blindern\\UKA\\Billett\\'.$name.$guest;

        return $class;
    }
}
