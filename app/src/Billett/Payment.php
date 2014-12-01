<?php namespace Blindern\UKA\Billett;

class Payment extends \Eloquent {
	protected $model_suffix = '';
    protected $table = 'payments';
	protected $hidden = array('data');

	public function order()
	{
		return $this->belongsTo('\\Blindern\\UKA\\Billett\\Order'.$this->model_suffix, 'order_id');
	}

	public function paymentgroup()
	{
		return $this->belongsTo('\\Blindern\\UKA\\Billett\\Paymentgroup'.$this->model_suffix, 'group_id');
	}
}
