<?php namespace Blindern\UKA\Billett;

class Order extends \Eloquent {
	protected $table = 'orders';

	public function tickets()
	{
		return $this->hasMany('\\Blindern\\UKA\\Billett\\Ticket');
	}

	public function payments()
	{
		return $this->hasMany('\\Blindern\\UKA\\Billett\\Payment');
	}
}
