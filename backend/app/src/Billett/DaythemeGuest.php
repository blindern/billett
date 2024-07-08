<?php

namespace Blindern\UKA\Billett;

class DaythemeGuest extends Daytheme
{
    protected $model_suffix = 'Guest';

    protected $visible = [
        'id',
        'title',
        'date',
    ];
}
