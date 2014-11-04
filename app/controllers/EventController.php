<?php

use Blindern\UKA\Billett\Event;
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

        $ev->load('eventgroup');
        $ev->load(array('ticketgroups' => function($query)
        {
            $query->where('is_published', 1);
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
        foreach ($event->ticketGroups as $group) {
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
        $order->load('tickets.ticketGroup', 'tickets.event');
        return $order;
    }
}