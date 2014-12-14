<?php namespace Henrist\LaravelApiQuery\Processors;

use Henrist\LaravelApiQuery\Handler;
use Illuminate\Http\Request;

interface ProcessorInterface {
    public function process(Handler $handler, Request $request);
}
