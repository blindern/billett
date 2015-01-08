<?php

use Blindern\UKA\Billett\Eventgroup;
use Blindern\UKA\Billett\Paymentgroup;

class PaymentgroupController extends \Controller {
    public function __construct()
    {
        $this->beforeFilter('auth');
    }

    public function index()
    {
        return \ApiQuery::processCollection(Paymentgroup::query());
    }

    public function show($id)
    {
        $eg = Paymentgroup::with('eventgroup')->findOrFail($id);
        return $eg;
    }

    public function store()
    {
        $validator = \Validator::make(\Input::all(), [
            'eventgroup_id' => 'required|integer',
            'title' => 'required',
            'description' => ''
        ]);

        if ($validator->fails()) {
            return \Response::json('data validation failed', 400);
        }

        $eg = Eventgroup::find(\Input::get('eventgroup_id'));
        if (!$eg) {
            return \Response::json('eventgroup not found', 400);
        }

        $pg = new Paymentgroup;
        $pg->title = \Input::get('title');
        $pg->description = \Input::get('description');

        $pg->time_start = time();
        $pg->user_created = \Auth::user()->username;

        $pg->eventgroup()->associate($eg);
        $pg->save();

        return $pg;
    }

    public function update($id) {
        // we allow updated of metadata even if paymentgroup is ended

        $pg = Paymentgroup::with('eventgroup')->findOrFail($id);

        $validator = \Validator::make(\Input::all(), [
            'title' => 'required',
            'description' => ''
        ]);

        if ($validator->fails()) {
            return \Response::json('data validation failed', 400);
        }

        $pg->title = \Input::get('title');
        $pg->description = \Input::get('description');
        $pg->save();

        return $pg;
    }

    public function close($id) {
        $pg = Paymentgroup::with('eventgroup')->findOrFail($id);

        if ($pg->time_end) {
            return \Response::json('paymentgroup is already closed', 400);
        }

        $pg->time_end = time();
        $pg->user_closed = \Auth::user()->username;
        $pg->save();

        return $pg;
    }
}
