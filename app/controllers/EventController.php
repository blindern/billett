<?php

use Blindern\UKA\Billett\Event;
use Blindern\UKA\Billett\Eventgroup;
use Blindern\UKA\Billett\Order;

class EventController extends Controller {
    public function getUpcoming()
    {
        return Event::with('eventgroup')->get();
    }

    public function show($id_or_alias)
    {
        $ev = Event::find($id_or_alias);
        if (!$ev)
        {
            $ev = Event::where('alias', $id_or_alias)->first();
        }

        if (!$ev) {
            return Response::json('not found', 404);
        }

        // TODO: auth requirement for showing hidden data
        $show_all = true;
        if ($show_all && Input::has('simple')) $show_all = false;

        $ev->load('eventgroup');
        $ev->load(array('ticketgroups' => function($query) use ($show_all)
        {
            if ($show_all) $query->get();
            else $query->where('is_published', 1);
        }));

        return $ev;
    }

    public function createReservation($id) {
        $event = Event::find($id);
        if (!$event) {
            return Response::json('not found', 404);
        }

        if ($event->is_timeout) {
        	return Response::json('too late to make reservation', 403);
        }

        $groups = Input::get('ticketgroups');
        if (!is_array($groups)) {
            return Response::json('error in ticketgroups', 400);
        }

        // check the groups
        $groups_to_add = array();
        foreach ($event->ticketgroups as $group) {
            if (isset($groups[$group->id])) {
                $val = $groups[$group->id];

                if (!$group->is_published || !is_numeric($val)) continue;

                $groups_to_add[] = array($group, $val);
                unset($groups[$group->id]);
            }
        }
        if (count($groups) > 0) {
        	return Response::json('error in ticketgroups', 400);
        }

        // check count
        if (!$event->checkIsAvailable($groups_to_add)) {
            return Response::json('tickets not available', 400);
        }

        // create a new reservation
        $order = Order::createReservation($groups_to_add);
        $order->load('tickets.ticketgroup', 'tickets.event');
        return $order;
    }

    /**
     * Create new event
     */
    public function store()
    {
        // TODO: auth requirements

        $validator = \Validator::make(Input::all(), array(
            'group_id' => 'required|integer',
            'title' => 'required',
            'time_start' => 'required|integer',
            'time_end' => 'integer',
            'category' => '',
            'location' => '',
            'max_sales' => 'required|integer',
            'max_normal_sales' => 'integer',
            'max_each_person' => 'required|integer'
        ));

        if ($validator->fails()) {
            return \Response::json('data validation failed', 400);
        }

        $group = Eventgroup::find(Input::get('group_id'));
        if (!$group) {
            return Response::json('group id not found', 404);
        }

        $event = new Event;
        $event->title = Input::get('title');
        $event->time_start = Input::get('time_start');
        $event->time_end = Input::get('time_end');
        $event->category = Input::get('category');
        $event->location = Input::get('location');
        $event->max_sales = Input::get('max_sales');
        $event->max_normal_sales = Input::get('max_normal_sales');
        $event->max_each_person = Input::get('max_each_person');

        $group->events()->save($event);

        return $event;
    }

    /**
     * Update event
     */
    public function update($id)
    {
        // TODO: auth requirements

        // TODO: https://github.com/blindernuka/billett/issues/18

        $e = Event::findOrFail($id);

        if (Input::has('is_published')) {
            $e->is_published = (bool) Input::get('is_published');
        }

        if (Input::has('is_selling')) {
            $e->is_selling = (bool) Input::get('is_selling');
        }

        $e->save();
        return $e;
    }

    /**
     * Delete event
     */
    public function destroy($id)
    {
        // TODO: auth requirements

        $e = Event::findOrFail($id);
        if ($e->has_tickets) {
            return Response::json('event cannot be deleted - there are tickets in the system', 400);
        }

        $e->delete();
        return 'deleted';
    }
}