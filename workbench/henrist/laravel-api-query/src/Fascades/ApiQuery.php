<?php namespace Henrist\LaravelApiQuery\Facades;

use Illuminate\Support\Facades\Facade;

class ApiQuery extends Facade {

    /**
     * Get the registered name of the component.
     *
     * @return string
     */
    protected static function getFacadeAccessor() {
        return 'ApiQuery';
    }

}
