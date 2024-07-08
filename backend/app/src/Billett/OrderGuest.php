<?php

namespace Blindern\UKA\Billett;

class OrderGuest extends Order
{
    protected $model_suffix = 'Guest';

    protected $visible = [
        'id',
        'email',
        'is_valid',
        'name',
        'order_text_id',
        'payments',
        'phone',
        'recruiter',
        'tickets',
        'time',
        'total_amount',
    ];

    protected $appends = [
        'total_amount',
    ];
}
