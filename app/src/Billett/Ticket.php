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

	/**
	 * Generate a unique ticket key used for barcode
	 *
	 * @return string ticket key
	 */
	public static function generateKey()
	{
		// keys consists of 6 numbers zeropadded
        do
        {
            $key = str_pad(rand(1, 999999), 6, "0", STR_PAD_LEFT);
            
            // check if it exists
            $ticket = Ticket::where('key', $key)->first();
        } while ($ticket); // if we have ticket we failed; retry
        
        return $key;
	}
}
