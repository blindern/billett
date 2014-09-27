<?php namespace Blindern\UKA\Billett;

class Payment extends \Eloquent {
	protected $table = 'payments';

	public function order()
	{
		return $this->belongsTo('\\Blindern\\UKA\\Billett\\Order', 'order_id');
	}

	public function paymentGroup()
	{
		return $this->belongsTo('\\Blindern\\UKA\\Billett\\PaymentGroup', 'group_id');
	}
}
