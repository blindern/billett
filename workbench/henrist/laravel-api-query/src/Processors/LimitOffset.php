<?php namespace Henrist\LaravelApiQuery\Processors;

use Henrist\LaravelApiQuery\Handler;
use Illuminate\Http\Request;

class LimitOffset implements ProcessorInterface {
    /**
     * Default limit of results
     * TODO: config option?
     *
     * @var integer
     */
    protected $defaultPageLimit = 10;

    /**
     * @override
     */
    public function process(Handler $apiquery, Request $request)
    {
        if ($request->has('limit')) {
            $apiquery->getQuery()->limit((int)$request->get('limit'));
        }

        if ($request->has('offset')) {
            $apiquery->getQuery()->offset((int)$request->get('offset'));
        }

        if (!$apiquery->getQuery()->limit) {
            $apiquery->getQuery()->limit($this->defaultPageLimit);
        }
    }
}
