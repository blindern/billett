<?php

use Blindern\UKA\Billett\Event;
use Blindern\UKA\Billett\Ticketgroup;

class TicketgroupController extends Controller {
    public function index()
    {
        $this->beforeFilter('auth');
        return Ticketgroup::with('event')->paginate();
    }

    public function show($id)
    {
        $g = Ticketgroup::findOrFail($id);

        $show_all = \Auth::hasRole('billett.admin');
        if (!$show_all && !$g->is_published) {
            App::abort(404);
        }

        if ($show_all) {
            $g->has_tickets = $g->has_tickets;
        }

        $g->load('event', 'event.eventgroup');
        return $g;
    }

    /**
     * Create new ticket group
     */
    public function store()
    {
        $this->beforeFilter('auth');

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

        $g = new Ticketgroup;
        $g->title = Input::get('title');
        $g->is_normal = Input::get('is_normal');
        $g->ticket_text = Input::get('ticket_text');
        $g->price = Input::get('price');
        $g->fee = Input::get('fee');
        $g->limit = Input::get('limit');
        if (empty($g->limit)) $g->limit = null;

        $event->ticketgroups()->save($g);
        return $g;
    }

    /**
     * Update event
     */
    public function update($id)
    {
        $this->beforeFilter('auth');

        $g = Ticketgroup::findOrFail($id);

        $locked_fields = array(
            'title' => 'required',
            'ticket_text' => '',
            'price' => 'required|integer',
            'fee' => 'integer'
        );
        $other_fields = array(
            'is_active' => '',
            'is_published' => '',
            'is_normal' => '',
            'limit' => 'integer'
        );

        $fields = $g->has_tickets ? $other_fields : array_merge($other_fields, $locked_fields);
        $validator = \Validator::make(Input::all(), $fields);

        if (!$g->has_tickets) {
            $g->title = Input::get('title');
            $g->ticket_text = Input::get('ticket_text');
            $g->price = Input::get('price');
            $g->fee = Input::get('fee');
        }

        $g->is_active = Input::get('is_active');
        $g->is_published = Input::get('is_published');
        $g->is_normal = Input::get('is_normal');
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
        $this->beforeFilter('auth');

        $g = Ticketgroup::findOrFail($id);
        if ($g->has_tickets) {
            return Response::json('ticketgroup cannot be deleted - there are tickets in the system', 400);
        }

        $g->delete();
        return 'deleted';
    }
}