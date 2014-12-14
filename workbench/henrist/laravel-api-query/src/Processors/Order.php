<?php namespace Henrist\LaravelApiQuery\Processors;

use Henrist\LaravelApiQuery\ApiQueryInterface;
use Henrist\LaravelApiQuery\Exceptions\InvalidModelException;
use Henrist\LaravelApiQuery\Exceptions\UnknownFieldException;
use Henrist\LaravelApiQuery\Handler;
use Illuminate\Http\Request;

class Order implements ProcessorInterface {
    /**
     * @override
     */
    public function process(Handler $apiquery, Request $request)
    {
        if (!$request->has('order')) return;

        $model = $apiquery->getBuilder()->getModel();
        if (!($model instanceof ApiQueryInterface)) {
            throw (new InvalidModelException)->setModel($model);
        }

        $allowedFields = $model->getApiAllowedFields();

        foreach (explode(",", $request->get('order')) as $order) {
            $dir = 'asc';
            if ($order[0] == '-') {
                $dir = 'desc';
                $order = substr($order, 1);
            }

            if (!in_array($order, $allowedFields)) {
                throw (new UnknownFieldException("Filter field is not in allowed list"))->setModel($model)->setField($order);
            }

            $apiquery->getQuery()->orderBy($order, $dir);
        }
    }
}
