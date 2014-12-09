<?php namespace Blindern\UKA\Billett;

class Eventgroup extends \Eloquent {
    protected $model_suffix = '';
    protected $table = 'eventgroups';

    public function events()
    {
        return $this->hasMany('\\Blindern\\UKA\\Billett\\Event'.$this->model_suffix, 'group_id');
    }
}
