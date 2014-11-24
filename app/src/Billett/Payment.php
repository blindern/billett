<?php namespace Blindern\UKA\Billett;

class Payment extends \Eloquent {
	protected $table = 'payments';

	public function order()
	{
		return $this->belongsTo('\\Blindern\\UKA\\Billett\\Order', 'order_id');
	}

	public function paymentgroup()
	{
		return $this->belongsTo('\\Blindern\\UKA\\Billett\\Paymentgroup', 'group_id');
	}
}
