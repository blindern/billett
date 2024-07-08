<?php

use Blindern\UKA\Billett\Paymentgroup;
use Blindern\UKA\Billett\Paymentsource;

class PaymentsourceController extends \Controller
{
    public function __construct()
    {
        $this->beforeFilter('auth');
    }

    public function index()
    {
        return \ApiQuery::processCollection(Paymentsource::query());
    }

    public function show($id)
    {
        return Paymentsource::with(
            'paymentgroup'
        )->findOrFail($id);
    }

    public function store()
    {
        $validator = \Validator::make(\Input::all(), [
            'paymentgroup_id' => 'required|integer',
            'type' => 'required|in:cash,other',
            'title' => 'required',
            'comment' => '',
            'amount' => 'numeric',
            'data' => '',
        ]);

        if ($validator->fails()) {
            return \Response::json('data validation failed', 400);
        }

        $pg = Paymentgroup::find(\Input::get('paymentgroup_id'));
        if (! $pg) {
            return \Response::json('paymentgroup not found', 400);
        }

        if ($pg->time_end) {
            return \Response::json('paymentgroup is closed', 400);
        }

        $ps = new Paymentsource;

        $ps->time_created = time();
        $ps->user_created = \Auth::user()->username;

        $ps->type = \Input::get('type');

        $ps->title = \Input::get('title');
        $ps->comment = \Input::get('comment');
        $ps->amount = \Input::get('amount');

        $ps->data = \Input::get('data');

        $ps->paymentgroup()->associate($pg);
        $ps->save();

        return $ps;
    }

    public function update($id)
    {
        // only title and comment is allowed updated
        $ps = Paymentsource::findOrFail($id);

        if (\Input::exists('title')) {
            $ps->title = \Input::get('title');
        }

        if (\Input::exists('comment')) {
            $ps->comment = \Input::get('comment');
        }

        $ps->save();

        return $ps;
    }

    public function destroy($id)
    {
        $ps = Paymentsource::with('paymentgroup')->findOrFail($id);

        if ($ps->is_deleted) {
            return \Response::json('element is already deleted', 400);
        }

        if ($ps->paymentgroup->time_end) {
            return \Response::json('paymentgroup is already closed', 400);
        }

        $ps->is_deleted = true;
        $ps->time_deleted = time();
        $ps->user_deleted = \Auth::user()->username;
        $ps->save();

        return $ps;
    }
}
