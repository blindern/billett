<?php namespace Blindern\UKA\Billett;

class PaymentGroup extends \Eloquent {
	protected $table = 'paymentgroups';

	public function payments()
	{
		return $this->hasMany('\\Blindern\\UKA\\Billett\\Payment');
	}
}
