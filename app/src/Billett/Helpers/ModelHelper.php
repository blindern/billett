<?php namespace Blindern\UKA\Billett\Helpers;

class ModelHelper {
    public static function getModelPath($name)
    {
        $guest = 'Guest';

        if (\Input::has('admin'))
        {
            // TODO: auth requirement
            $guest = '';
        }

        $class = '\\Blindern\\UKA\\Billett\\'.$name.$guest;
        return $class;
    }
}
