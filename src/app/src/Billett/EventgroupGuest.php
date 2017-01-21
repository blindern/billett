<?php namespace Blindern\UKA\Billett;

class EventgroupGuest extends Eventgroup {
    protected $model_suffix = 'Guest';
    protected $visible = array(
        'id',
        'title',
        'events',
	'daythemes'
    );
}
