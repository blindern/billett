<?php namespace Blindern\UKA\Billett;

class TicketgroupGuest extends Ticketgroup {
    protected $visible = array(
        'id',
        'price',
        'fee',
        'title',
        'ticket_text'
    );
}
