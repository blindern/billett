<?php

namespace App\Http\Controllers;

use Blindern\UKA\Billett\Auth\Roles;
use Blindern\UKA\Billett\Event;
use Blindern\UKA\Billett\Eventgroup;
use Blindern\UKA\Billett\EventGuest;
use Blindern\UKA\Billett\Helpers\ModelHelper;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Validator;
use Intervention\Image\Laravel\Facades\Image;

class EventController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth', [
            'only' => [
                'store',
                'update',
                'destroy',
                'uploadImage',
            ]]);
    }

    public function getUpcoming()
    {
        return EventGuest::with('eventgroup')
            ->where('is_published', true)
            ->where('time_start', '>', time() - 3600 * 1.5)
            ->orderBy('time_start')->limit(6)->get();
    }

    public function show($id_or_alias)
    {
        $class = ModelHelper::getModelPath('Event');
        $ev = $class::findByAliasOrFail($id_or_alias);

        if (! $ev->is_published && ! Roles::hasRole('billett.admin')) {
            App::abort(404);
        }

        $show_all = false;
        if (Roles::hasRole('billett.admin') && Request::has('admin')) {
            $show_all = true;
        }

        $ev->load('eventgroup');
        $ev->load(['ticketgroups' => function ($query) use ($show_all) {
            if ($show_all) {
                $query->get();
            } else {
                $query->where('use_web', true);
            }
        }]);

        if (Request::exists('checkin')) {
            // make sure checkin-variable gets populated
            $ev->checkin = true;
        }

        return $ev;
    }

    public function createReservation($id)
    {
        $class = ModelHelper::getModelPath('Event');
        $event = $class::findOrFail($id);

        if (! $event->is_published && ! Roles::hasRole('billett.admin')) {
            App::abort(404);
        }

        if ($event->is_timeout) {
            return Response::json('too late to make reservation', 403);
        }

        $groups = Request::get('ticketgroups');
        if (! is_array($groups)) {
            return Response::json('error in ticketgroups', 400);
        }

        // check the groups
        $groups_to_add = [];
        foreach ($event->ticketgroups as $group) {
            if (isset($groups[$group->id])) {
                $val = $groups[$group->id];

                if (! $group->use_web) {
                    continue;
                }
                if (filter_var($val, FILTER_VALIDATE_INT) === false || $val <= 0) {
                    continue;
                }

                $groups_to_add[] = [$group, $val];
                unset($groups[$group->id]);
            }
        }
        if (count($groups) > 0) {
            return Response::json('error in ticketgroups', 400);
        }

        // check count
        if (! $event->checkIsAvailable($groups_to_add)) {
            return Response::json('tickets not available', 400);
        }

        // create a new reservation
        $class = ModelHelper::getModelPath('Order');
        $order = $class::createReservation($event->eventgroup);

        $order->createTickets($groups_to_add);

        // store in session so we know which orders belong to this user
        $orders = Session::get('billett_reservations', []);
        $orders[] = $order->id;
        Session::put('billett_reservations', $orders);

        $order->load('tickets.ticketgroup', 'tickets.event');

        return $order;
    }

    /**
     * Validate input data for new and update methods and update event (but not save)
     */
    private function validateInputAndUpdate(Event $event, $is_new)
    {
        $fields = [
            'eventgroup_id' => 'nullable|integer',
            'title' => '',
            'alias' => '',
            'time_start' => 'nullable|integer',
            'time_end' => 'nullable|integer',
            'category' => '',
            'location' => '',
            'ticket_info' => '',
            'selling_text' => '',
            'max_sales' => 'nullable|integer',
            'max_normal_sales' => 'nullable|integer',
            'max_each_person' => 'nullable|integer',
            'description' => '',
            'description_short' => '',
            'ticket_text' => '',
            'link' => '',
            'age_restriction' => 'nullable|integer',
        ];

        if ($is_new) {
            $fields['eventgroup_id'] = 'required|integer';
            $fields['title'] = 'required';
            $fields['time_start'] = 'required|integer';
            $fields['max_sales'] = 'required|integer';
            $fields['max_each_person'] = 'required|integer';
        }

        $validator = Validator::make(Request::all(), $fields);

        if ($validator->fails()) {
            return Response::json('data validation failed: '.$validator->errors(), 400);
        }

        if (Request::has('eventgroup_id') && (Request::get('eventgroup_id') != $event->eventgroup_id || $is_new)) {
            $group = Eventgroup::find(Request::get('eventgroup_id'));
            if (! $group) {
                return Response::json('eventgroup id not found', 400);
            }

            $event->eventgroup()->associate($group);
        }

        $list = [
            'title',
            'time_start',
            'time_end',
            'category',
            'location',
            'ticket_info',
            'selling_text',
            'max_sales',
            'max_normal_sales',
            'max_each_person',
            'description',
            'description_short',
            'ticket_text',
            'link',
            'age_restriction',
        ];

        // can only edit alias when not published
        if (! $event->id || ! $event->is_published) {
            $list[] = 'alias';
        }

        foreach ($list as $field) {
            if (Request::exists($field) && Request::get($field) !== $event->{$field}) {
                $val = Request::get($field);
                if ($val === '') {
                    $val = null;
                }
                $event->{$field} = $val;
            }
        }

        if (Request::exists('is_admin_hidden')) {
            $event->is_admin_hidden = (bool) Request::get('is_admin_hidden');
        }

        if (Request::exists('is_published')) {
            $event->is_published = (bool) Request::get('is_published');
        }

        if (Request::exists('is_selling')) {
            $event->is_selling = (bool) Request::get('is_selling');
        }

        return $event;
    }

    /**
     * Create new event
     */
    public function store()
    {
        $event = $this->validateInputAndUpdate(new Event, true);
        if (! ($event instanceof Event)) {
            return $event;
        }

        $event->save();

        return $event;
    }

    /**
     * Update event
     */
    public function update($id)
    {
        $event = $this->validateInputAndUpdate(Event::findOrFail($id), false);
        if (! ($event instanceof Event)) {
            return $event;
        }

        $event->save();

        return $event;
    }

    /**
     * Delete event
     */
    public function destroy($id)
    {
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
    public function uploadImage($id)
    {
        $event = Event::findOrFail($id);

        if (! Request::hasFile('file')) {
            App::abort(400, 'Missing image');
        }

        try {
            $event->image = Image::read(Request::file('file'))->scale(275, null)->toJpeg(75);
            $event->save();

            return 'ok';
        } catch (\Intervention\Image\Exceptions\DecoderException $e) {
            App::abort(400, 'Could not read image');
        }
    }

    /**
     * Get event image
     */
    public function image($id)
    {
        $event = Event::findOrFail($id);

        if (! $event->is_published && ! Roles::hasRole('billett.admin')) {
            App::abort(404);
        }

        $img = $event->image;
        if (! $img) {
            $img = file_get_contents(resource_path('images/event_no_image.jpg'));
        }

        // image should be jpeg
        return Response::make($img, 200, [
            'Content-Type' => 'image/jpeg',
            'Content-Length' => strlen($img)]);
    }

    /**
     * Change sorting on ticketgroups
     */
    public function ticketgroupsSetOrder($id)
    {
        $event = Event::findOrFail($id);
        $groups = $event->ticketgroups;

        $changed = 0;
        foreach ($groups as $group) {
            if (Request::has($group->id)) {
                $new_order = Request::get($group->id);
                if ($new_order != $group->order) {
                    $group->order = $new_order;
                    $group->save();
                    $changed++;
                }
            }
        }

        return $changed;
    }
}
