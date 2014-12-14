<?php namespace Henrist\LaravelApiQuery;

use Henrist\LaravelApiQuery\Processors\ProcessorInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class ApiQuery {

    /**
     * List of default processors
     */
    protected $processors = array();

    /**
     * Run a query for a Eloquent Builder model
     *
     * The model must implement ApiQueryInterface
     *
     * @param \Illuminate\Database\Eloquent\Builder
     * @return \Henrist\LaravelApiQuery\Handler
     */
    public function processCollection(Builder $builder, Request $request = null) {
        $obj = new Handler;

        $obj->setBuilder($builder);
        $obj->setRequest($request ?: \Request::instance());
        $obj->setProcessors($this->processors);

        return $obj;
    }

    /**
     * Add default processor
     *
     * @param ProcessorInterface $processor
     */
    public function addDefaultProcessor(ProcessorInterface $processor)
    {
        $this->processors[] = $processor;
    }

}