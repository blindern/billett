<?php

use Blindern\UKA\Billett\Eventgroup;
use Blindern\UKA\Billett\Helpers\ModelHelper;

class EventgroupController extends Controller {
    public function index() {
        $class = ModelHelper::getModelPath('Eventgroup');
        return $class::orderBy('sort_value')->get();
    }

    public function show($id) {
        $class = ModelHelper::getModelPath('Eventgroup');
        return $class::with(array('events' => function($q) {
            $q->orderBy('time_start');

            if (!\Auth::hasRole('billett.admin') || !\Input::has('admin')) $q->where('is_published', true);
        }))->findOrFail($id);
    }

    /**
     * Special list for blindernuka.no
     */
    public function simpleList($id)
    {
        $group = Eventgroup::with(array('events' => function($query)
        {
            $query->where('is_published', true);
            $query->orderBy('time_start');
        }, 'events.ticketgroups'))->findOrFail($id);

        /*var_dump(\DB::getQueryLog());
        die;*/

        $list = array();
        foreach ($group->events as $event) {
            $list[] = array(
                'id' => $event->id,
                'category' => $event->category,
                'title' => $event->title,
                'time_start' => $event->time_start,
                'status' => $event->web_selling_status,
                'location' => $event->location,
                'rel_link' => $event->link,
                'url' => url('event/'.$event->id),
                'ticket_info' => $event->ticket_info
            );
        }

        return $list;
    }

    /**
     * Sold tickets stats
     */
    public function soldTicketsStats($id) {
        Eventgroup::findOrFail($id);
        return \Blindern\UKA\Billett\Ticket::getStats($id);
    }
}