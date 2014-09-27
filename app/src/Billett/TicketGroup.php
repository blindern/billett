<?php namespace Blindern\UKA\Billett;

class TicketGroup extends \Eloquent {
	protected $table = 'ticketgroups';

	public function tickets()
	{
		return $this->hasMany('\\Blindern\\UKA\\Billett\\Ticket');
	}

	public function event()
	{
		return $this->belongsTo('\\Blindern\\UKA\\Billett\\Event', 'event_id');
	}
}
