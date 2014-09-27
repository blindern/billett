<?php namespace Blindern\UKA\Billett;

use \Blindern\UKA\Billett\EventGroup;

class Event extends \Eloquent {
	protected $table = 'events';

	public function eventGroup()
	{
		return $this->belongsTo('\\Blindern\\UKA\\Billett\\EventGroup', 'group_id');
	}

	public function ticketGroups()
	{
		return $this->hasMany('\\Blindern\\UKA\\Billett\\TicketGroup');
	}

	public function tickets()
	{
		return $this->hasMany('\\Blindern\\UKA\\Billett\\Ticket');
	}
}
