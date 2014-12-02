<?php namespace Blindern\UKA\Billett;

class Paymentgroup extends \Eloquent {
	protected $model_suffix = '';
    protected $table = 'paymentgroups';

	public function payments()
	{
		return $this->hasMany('\\Blindern\\UKA\\Billett\\Payment'.$this->model_suffix, 'paymentgroup_id');
	}
}
