<?php namespace Blindern\UKA\Billett;

class TicketGroup extends \Eloquent {
    protected $table = 'ticketgroups';

    public function getPriceAttribute($val) {
        return (float) $val;
    }

    public function getFeeAttribute($val) {
        return (float) $val;
    }

	public function tickets()
	{
		return $this->hasMany('\\Blindern\\UKA\\Billett\\Ticket');
	}

	public function event()
	{
		return $this->belongsTo('\\Blindern\\UKA\\Billett\\Event', 'event_id');
	}
}
