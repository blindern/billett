<?php namespace Henrist\LaravelApiQuery\Processors;

use Henrist\LaravelApiQuery\ApiQueryInterface;
use Henrist\LaravelApiQuery\Exceptions\InvalidModelException;
use Henrist\LaravelApiQuery\Exceptions\UnknownRelationException;
use Henrist\LaravelApiQuery\Handler;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class With implements ProcessorInterface {
    /**
     * @override
     */
    public function process(Handler $apiquery, Request $request)
    {
        if ($request->has('with')) {
            foreach (explode(",", $request->get('with')) as $relation) {
                if ($this->verifyRelation($apiquery->getBuilder()->getModel(), $relation)) {
                    $apiquery->getBuilder()->with($relation);
                }
            }
        }
    }

    /**
     * Check if relations are allowed
     *
     * @param Model $model
     * @param string $relation
     * @return bool
     * @throws InvalidModelException
     * @throws UnknownRelationException
     */
    protected function verifyRelation(Model $model, $relation)
    {
        if (!($model instanceof ApiQueryInterface)) {
            throw (new InvalidModelException)->setModel($model);
        }

        $allowedRelations = $model->getApiAllowedRelations();

        $baseRelation = $relation;
        if (($pos = strpos($relation, '.')) !== false) {
            $baseRelation = substr($relation, 0, $pos);
        }

        if (!in_array($baseRelation, $allowedRelations)) {
            throw (new UnknownRelationException("Relation to filter is not in allowed list"))->setModel($model)->setRelation($baseRelation);
        }

        if ($pos !== false) {
            return $this->verifyRelation(
                $model->$baseRelation()->getRelated(),
                substr($relation, $pos + 1)
            );
        }

        return true;
    }
}
