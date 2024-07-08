<?php

namespace Blindern\UKA\Billett;

class EventGuest extends Event
{
    protected $model_suffix = 'Guest';

    protected $appends = ['is_timeout', 'is_old', 'web_selling_status'];

    protected $hidden = ['image'];

    protected $visible = [
        'id',
        'alias',
        'is_published',
        'time_start',
        'time_end',
        'title',
        'category',
        'location',
        'description',
        'description_short',
        'age_restriction',
        'web_selling_status',
        'ticketgroups',
        'eventgroup',
        'max_each_person',
        'ticket_info',
        'selling_text',
        'link',
    ];

    public function getSellingTextAttribute($val)
    {
        if ($this->is_selling && $this->web_selling_status != 'no_web_tickets') {
            return null;
        }

        return $val;
    }
}
