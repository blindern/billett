<?php namespace Henrist\LaravelApiQuery\Exceptions;

use Illuminate\Database\Eloquent\Model;

class UnknownRelationException extends ApiQueryException {
    /**
     * @var \Illuminate\Database\Eloquent\Model
     */
    protected $model;

    /**
     * @var string
     */
    protected $relation;

    /**
     * @param Model $model
     * @return $this
     */
    public function setModel(Model $model)
    {
        $this->model = $model;
        return $this;
    }

    /**
     * @param string $relation
     * @return $this
     */
    public function setRelation($relation)
    {
        $this->relation = $relation;
        return $this;
    }
}
