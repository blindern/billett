<?php namespace Henrist\LaravelApiQuery\Exceptions;

class InvalidFilterException extends ApiQueryException {
    /**
     * @var string
     */
    protected $filter;

    /**
     * @param string $filter
     * @return $this
     */
    public function setFilter($filter)
    {
        $this->filter = $filter;
        return $this;
    }
}
