<?php

use Blindern\UKA\Billett\Event;
use Blindern\UKA\Billett\EventGroup;
use Blindern\UKA\Billett\TicketGroup;

class TicketGroupController extends Controller {
    public function index()
    {
        // TODO: auth requirements
        return TicketGroup::with('event')->paginate();
    }

    public function show($id)
    {
        $g = TicketGroup::findOrFail($id);

        // TODO: auth requirement for showing hidden data
        $show_all = true;
        if (!$show_all && !$g->is_published) {
            App::abort(404);
        }

        $g->load('event', 'event.eventgroup');
        return $g;
    }

    /**
     * Create new ticket group
     * # FIXES #32
     */
    public function store()
    {
        // TODO: auth requirements

        $validator = \Validator::make(Input::all(), array(
            'event_id' => 'required|integer',
            'title' => 'required',
            'is_normal' => '',
            'ticket_text' => '',
            'price' => 'required|integer',
            'fee' => 'integer',
            'limit' => 'integer'
        ));

        if ($validator->fails()) {
            return \Response::json('data validation failed', 400);
        }

        $event = Event::find(Input::get('event_id'));
        if (!$event) {
            return Response::json('event not found', 404);
        }

        $g = new TicketGroup;
        $g->title = Input::get('title');
        $g->is_normal = Input::get('is_normal');
        $g->ticket_text = Input::get('ticket_text');
        $g->price = Input::get('price');
        $g->fee = Input::get('fee');
        $g->limit = Input::get('limit');
        if (empty($g->limit)) $g->limit = null;

        $event->ticketGroups()->save($g);
        return $g;
    }

    /**
     * Update event
     */
    public function update($id)
    {
        // TODO: auth requirements
        // TODO: some fields should be locked when valid/reserved tickets

        $g = TicketGroup::findOrFail($id);

        $validator = \Validator::make(Input::all(), array(
            'title' => 'required',
            'is_active' => '',
            'is_published' => '',
            'is_normal' => '',
            'ticket_text' => '',
            'price' => 'required|integer',
            'fee' => 'integer',
            'limit' => 'integer'
        ));

        $g->title = Input::get('title');
        $g->is_active = Input::get('is_active');
        $g->is_published = Input::get('is_published');
        $g->is_normal = Input::get('is_normal');
        $g->ticket_text = Input::get('ticket_text');
        $g->price = Input::get('price');
        $g->fee = Input::get('fee');
        $g->limit = Input::get('limit');
        if (empty($g->limit)) $g->limit = null;

        $g->save();
        $g->load('event', 'event.eventgroup');
        return $g;
    }

    /**
     * Delete event
     */
    public function destroy($id)
    {
        // TODO: auth requirements
        // TODO: deny destroy of ticketgroups with valid tickets

        $g = TicketGroup::findOrFail($id);
        $g->delete();

        return 'deleted';
        // TODO: https://github.com/blindernuka/billett/issues/21
    }
}