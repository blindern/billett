<?php namespace Blindern\UKA\Billett;

class EventGroup extends \Eloquent {
	protected $table = 'eventgroups';

	public function events()
	{
		return $this->hasMany('\\Blindern\\UKA\\Billett\\Event');
	}
}
