<?php namespace Blindern\UKA\Billett;

class EventGuest extends Event {
    protected $model_suffix = 'Guest';
    protected $appends = array('is_timeout', 'is_old', 'web_selling_status');
    protected $hidden = array('image');
    protected $visible = array(
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
        'link'
    );

    public function getSellingTextAttribute($val) {
        if ($this->is_selling && $this->web_selling_status != 'no_web_tickets') return null;
        return $val;
    }
}
