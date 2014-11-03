<?php namespace Blindern\UKA\Billett;

use \Blindern\UKA\Billett\EventGroup;

class Event extends \Eloquent {
	protected $table = 'events';

	/**
	 * When the online selling freezes (how many seconds before event start)
	 */
	const SELL_TIMEOUT = 3600;

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

	/**
	 * Check if we can sell now to guests now
	 */
	public function isTimeout()
	{
		return $this->time_start - SELL_TIMEOUT > time();
	}

	/**
	 * Get count of tickets used
	 */
	public function getCountTicketUsed()
	{
		return $this->tickets()->whereNotNull('used')->where('is_revoked', false)->count();
	}

}
