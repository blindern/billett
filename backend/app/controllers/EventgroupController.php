<?php

use Blindern\UKA\Billett\Eventgroup;
use Blindern\UKA\Billett\Helpers\ModelHelper;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Validator;

class EventgroupController extends Controller
{
    public function __construct()
    {
        $this->beforeFilter('auth', [
            'except' => [
                'index',
                'show',
                'simpleList',
            ],
        ]);
    }

    public function index()
    {
        $class = ModelHelper::getModelPath('Eventgroup');

        return $class::orderBy('sort_value')->get();
    }

    public function show($id)
    {
        $class = ModelHelper::getModelPath('Eventgroup');

        return $class::with([
            'events' => function ($q) {
                $q->orderBy('time_start');
                if (! Auth::hasRole('billett.admin') || ! Request::has('admin')) {
                    $q->where('is_published', true);
                }
            },
            'daythemes' => function ($q) {
                $q->orderBy('date');
            }])->findOrFail($id);
    }

    /**
     * Create new eventgroup
     */
    public function store()
    {
        $eventgroup = $this->validateInputAndUpdate(new Eventgroup, true);
        if (! ($eventgroup instanceof Eventgroup)) {
            return $eventgroup;
        }
        $eventgroup->save();

        return $eventgroup;
    }

    /**
     * Update event
     */
    public function update($id)
    {
        $eventgroup = $this->validateInputAndUpdate(Eventgroup::findOrFail($id), false);
        if (! ($eventgroup instanceof Eventgroup)) {
            return $eventgroup;
        }
        $eventgroup->save();

        return $eventgroup;
    }

    /**
     * Validate input data for new and update methods and update eventgroup (but not save)
     */
    private function validateInputAndUpdate(Eventgroup $eventgroup, $is_new)
    {
        $fields = [
            'title' => '',
        ];

        if ($is_new) {
            $fields['title'] = 'required';
        }

        $validator = Validator::make(Request::all(), $fields);
        if ($validator->fails()) {
            return Response::json('data validation failed', 400);
        }

        $list = [
            'title',
        ];

        foreach ($list as $field) {
            if (Request::exists($field) && Request::get($field) != $eventgroup->{$field}) {
                $val = Request::get($field);
                if ($val === '') {
                    $val = null;
                }
                $eventgroup->{$field} = $val;
            }
        }

        if (Request::exists('is_active')) {
            $eventgroup->is_active = (bool) Request::get('is_active');
        }

        $eventgroup->sort_value = date('Y-m-').explode(' ', $eventgroup->title)[0];

        return $eventgroup;

    }

    /**
     * Special list for blindernuka.no
     */
    public function simpleList($id)
    {
        $group = Eventgroup::with(['events' => function ($query) {
            $query->where('is_published', true);
            $query->orderBy('time_start');
        }, 'events.ticketgroups'])->findOrFail($id);

        /*var_dump(\DB::getQueryLog());
        die;*/

        $list = [];
        foreach ($group->events as $event) {
            $list[] = [
                'id' => $event->id,
                'category' => $event->category,
                'title' => $event->title,
                'time_start' => $event->time_start,
                'status' => $event->web_selling_status,
                'location' => $event->location,
                'rel_link' => $event->link,
                'url' => url('event/'.$event->id),
                'ticket_info' => $event->ticket_info,
            ];
        }

        return $list;
    }

    /**
     * Sold tickets stats
     */
    public function soldTicketsStats($id)
    {
        Eventgroup::findOrFail($id);

        return \Blindern\UKA\Billett\Ticket::getStats($id);
    }

    /**
     * Recruiter list
     */
    public function recruiterList($id)
    {
        $eventgroup = Eventgroup::findOrFail($id);

        return $eventgroup->getRecruiterList();
    }
}
