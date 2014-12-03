<?php

use Blindern\UKA\Billett\Event;
use Blindern\UKA\Billett\EventGuest;
use Blindern\UKA\Billett\Eventgroup;
use Blindern\UKA\Billett\Order;
use Blindern\UKA\Billett\Helpers\ModelHelper;

class EventController extends Controller {
    public function getUpcoming()
    {
        return EventGuest::with('eventgroup')
            ->where('is_published', true)
            ->where('time_start', '>', time())
            ->orderBy('time_start')->limit(6)->get();
    }

    public function show($id_or_alias)
    {
        $class = ModelHelper::getModelPath('Event');
        $ev = $class::findByAliasOrFail($id_or_alias);

        $show_all = false;
        if (\Auth::check() && \Input::has('admin')) $show_all = true;

        $ev->load('eventgroup');
        $ev->load(array('ticketgroups' => function($query) use ($show_all)
        {
            if ($show_all) $query->get();
            else $query->where('is_published', true)->where('is_active', true);
        }));

        return $ev;
    }

    public function createReservation($id) {
        $class = ModelHelper::getModelPath('Event');
        $event = $class::findOrFail($id);

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

                if (!$group->is_published || !$group->is_active || !is_numeric($val)) continue;

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
        $class = ModelHelper::getModelPath('Order');
        $order = $class::createReservation($groups_to_add);

        $order->load('tickets.ticketgroup', 'tickets.event');
        return $order;
    }

    /**
     * Create new event
     */
    public function store()
    {
        $this->beforeFilter('auth');

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
        $this->beforeFilter('auth');

        // TODO: https://github.com/blindernuka/billett/issues/18

        $e = Event::findOrFail($id);

        // TODO: fix validation checks (required e.a.)
        $validator = \Validator::make(Input::all(), array(
            'group_id' => 'integer',
            'title' => '',
            'alias' => '',
            'time_start' => 'integer',
            'time_end' => 'integer',
            'category' => '',
            'location' => '',
            'max_sales' => 'integer',
            'max_normal_sales' => 'integer',
            'max_each_person' => 'integer',
            'description' => '',
            'description_short' => '',
            'ticket_text' => '',
            'link' => '',
            'age_restriction' => 'integer'
        ));

        if ($validator->fails()) {
            return \Response::json('data validation failed', 400);
        }

        $list = array(
            'title',
            'time_start',
            'time_end',
            'category',
            'location',
            'max_sales',
            'max_normal_sales',
            'max_each_person',
            'description',
            'description_short',
            'ticket_text',
            'link',
            'age_restriction'
        );

        // can only edit alias when not published
        if (!$e->is_published) {
            $list[] = 'alias';
        }

        foreach ($list as $field) {
            if (Input::has($field) && Input::get($field) != $e->{$field}) {
                $e->{$field} = Input::get($field);
            }
        }

        if (Input::has('is_admin_hidden')) {
            $e->is_admin_hidden = (bool) Input::get('is_admin_hidden');
        }

        if (Input::has('is_published')) {
            $e->is_published = (bool) Input::get('is_published');
        }

        if (Input::has('is_selling')) {
            $e->is_selling = (bool) Input::get('is_selling');
        }

        if (Input::has('group_id') && Input::get('group_id') != $e->group_id) {
            // TODO: validate and change group
        }

        $e->save();
        return $e;
    }

    /**
     * Delete event
     */
    public function destroy($id)
    {
        $this->beforeFilter('auth');

        $e = Event::findOrFail($id);
        if ($e->has_tickets) {
            return Response::json('event cannot be deleted - there are tickets in the system', 400);
        }

        $e->delete();
        return 'deleted';
    }

    /**
     * Image upload
     */
    public function uploadImage($id) {
        $this->beforeFilter('auth');

        $event = Event::findOrFail($id);

        if (!\Input::hasFile('file')) {
            App::abort(400, 'Missing image');
        }

        try {
            $event->image = \Image::make(\Input::file('file'))->resize(275, null, function($constraint) {
                $constraint->aspectRatio();
            })->encode('jpg', 75);
            $event->save();

            return 'ok';
        } catch (\Intervention\Image\Exception\NotReadableException $e) {
            App::abort(400, 'Could not read image');
        }
    }

    /**
     * Get event image
     */
    public function image($id) {
        $event = Event::findOrFail($id);

        $img = $event->image;
        if (!$img) {
            $img = file_get_contents(app_path().'/assets/images/event_no_image.jpg');
        }

        // image should be jpeg
        return Response::make($img, 200, array(
            'Content-Type' => 'image/jpeg',
            'Content-Length' => strlen($img)));
    }
}