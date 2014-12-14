<?php namespace Henrist\LaravelApiQuery;

use Henrist\LaravelApiQuery\Processors\ProcessorInterface;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Contracts\JsonableInterface;
use Illuminate\Support\Contracts\ArrayableInterface;
use Illuminate\Http\Request;

class Handler implements JsonableInterface, ArrayableInterface, \JsonSerializable {
    /**
     * @var \Illuminate\Database\Eloquent\Builder
     */
    protected $builder;

    /**
     * @var \Illuminate\Database\Query\Builder
     */
    protected $query;

    /**
     * Collection of processors
     */
    protected $processors = array();

    /**
     * Request
     *
     * @var \Illuminate\Http\Request
     */
    protected $request;

    /**
     * Set Eloquent Builder
     *
     * @param \Illuminate\Database\Eloquent\Builder
     */
    public function setBuilder(Builder $builder)
    {
        $this->builder = $builder;
        $this->query = $builder->getQuery();
    }

    /**
     * Get Eloquent Builder
     *
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function getBuilder()
    {
        return $this->builder;
    }

    /**
     * Get query builder
     *
     * @return \Illuminate\Database\Query\Builder
     */
    public function getQuery()
    {
        return $this->query;
    }

    /**
     * Add processor
     *
     * @param ProcessorInterface $processor
     */
    public function addProcessor(ProcessorInterface $processor)
    {
        $this->processors[] = $processor;
    }

    /**
     * Set processors list
     */
    public function setProcessors($processors)
    {
        $this->processors = $processors;
    }

    /**
     * Set request
     */
    public function setRequest(Request $request)
    {
        $this->request = $request;
    }

    /**
     * Process request
     */
    public function process()
    {
        // TODO: improve this somehow
        static $processed = false;
        if ($processed) return;
        $processed = true;

        foreach ($this->processors as $processor) {
            $processor->process($this, $this->request);
        }
    }

    /**
     * Convert the object into something JSON serializable.
     *
     * @return array
     */
    public function jsonSerialize()
    {
        return $this->toArray();
    }

    /**
     * Convert the object instance to an array.
     *
     * @return array
     */
    public function toArray()
    {
        $this->process();

        $count = $this->query->getPaginationCount();
        return [
            'pagination' => [
                'offset' => $this->query->offset ?: 0,
                'limit' => $this->query->limit ?: 0,
                'total' => $count
            ],
            'result' => $this->builder->get()->toArray()
        ];
    }

    /**
     * Convert the object to its string representation.
     *
     * @return string
     */
    public function __toString()
    {
        return $this->toJson();
    }

    /**
     * Convert the object instance to JSON.
     *
     * @param  int  $options
     * @return string
     */
    public function toJson($options = 0)
    {
        return json_encode($this->toArray(), $options);
    }
}
