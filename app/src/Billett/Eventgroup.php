<?php namespace Blindern\UKA\Billett;

use Henrist\LaravelApiQuery\ApiQueryInterface;

class Eventgroup extends \Eloquent implements ApiQueryInterface {
    protected $model_suffix = '';
    protected $table = 'eventgroups';

    protected $apiAllowedFields = array('id', 'is_active', 'title', 'sort_value');
    protected $apiAllowedRelations = array('events');

    public function events()
    {
        return $this->hasMany('\\Blindern\\UKA\\Billett\\Event'.$this->model_suffix, 'group_id');
    }

    /**
     * Get fields we can search in
     */
    public function getApiAllowedFields() {
        return $this->apiAllowedFields;
    }

    /**
     * Get fields we can use as relations
     */
    public function getApiAllowedRelations() {
        return $this->apiAllowedRelations;
    }
}
