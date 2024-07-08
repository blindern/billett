<?php

namespace Blindern\UKA\Billett;

class EventgroupGuest extends Eventgroup
{
    protected $model_suffix = 'Guest';

    protected $visible = [
        'id',
        'title',
        'events',
        'daythemes',
    ];
}
