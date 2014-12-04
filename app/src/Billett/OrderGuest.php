<?php namespace Blindern\UKA\Billett;

class OrderGuest extends Order {
    protected $model_suffix = 'Guest';
    protected $visible = array(
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
        'total_amount'
    );
}
