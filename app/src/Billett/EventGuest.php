<?php namespace Blindern\UKA\Billett;

class EventGuest extends Event {
    protected $model_suffix = 'Guest';
    protected $appends = array('is_timeout', 'is_old', 'web_selling_status');
    protected $hidden = array('image');
    protected $visible = array(
        'id',
        'alias',
        'time_start',
        'time_end',
        'title',
        'category',
        'location',
        'description',
        'age_restriction',
        'web_selling_status'
    );
}
