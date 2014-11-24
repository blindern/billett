<?php namespace Blindern\UKA\Billett;

class Paymentgroup extends \Eloquent {
	protected $table = 'paymentgroups';

	public function payments()
	{
		return $this->hasMany('\\Blindern\\UKA\\Billett\\Payment');
	}
}
