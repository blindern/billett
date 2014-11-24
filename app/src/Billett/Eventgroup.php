<?php namespace Blindern\UKA\Billett;

class Eventgroup extends \Eloquent {
	protected $table = 'eventgroups';

	public function events()
	{
		return $this->hasMany('\\Blindern\\UKA\\Billett\\Event', 'group_id');
	}
}
