<?php

namespace Blindern\UKA\Billett;

class TicketGuest extends Ticket
{
    protected $model_suffix = 'Guest';

    protected $visible = [
        'event_id',
        'event',
        'expire',
        'id',
        'number',
        'order_id',
        'order',
        'ticketgroup',
        'ticketgroup_id',
    ];
}
