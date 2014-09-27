<?php namespace Blindern\UKA\Billett;

class Ticket extends \Eloquent {
	protected $table = 'tickets';

	public function event()
	{
		return $this->belongsTo('\\Blindern\\UKA\\Billett\\Event', 'event_id');
	}

	public function order()
	{
		return $this->belongsTo('\\Blindern\\UKA\\Billett\\Order', 'order_id');
	}

	public function ticketGroup()
	{
		return $this->belongsTo('\\Blindern\\UKA\\Billett\\TicketGroup', 'ticketgroup_id');
	}
}
