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

        $groups = Input::get('ticketgroups');
        if (!is_array($groups)) {
            return Response::json('error', 400);
        }

        $allgroups = $event->ticketGroups()->get();
        $groups_to_add = array();
        $count = 0;
        
        // check the groups
        foreach ($allgroups as $group) {
            if (isset($groups[$group->id])) {
                if (!$group->is_published || !is_numeric($groups[$group->id])) continue;
                if ($group->limit && $groups[$group->id] > $group->limit) continue;
                $groups_to_add[] = array($group, $groups[$group->id]);
                $count += $groups[$group->id];
                unset($groups[$group->id]);
            }
        }
        if (count($groups) > 0) {
        	var_dump($groups);die;
            return Response::json('error', 400);
        }

        // TODO: check count

        // create a new reservation
        $order = Order::createReservation($groups_to_add);
        $order->load('tickets.ticketGroup', 'tickets.event');
        return $order;
    }
}