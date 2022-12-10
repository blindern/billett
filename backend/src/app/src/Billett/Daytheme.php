<?php namespace Blindern\UKA\Billett;

use \Blindern\UKA\Billett\Eventgroup;
use \Illuminate\Database\Eloquent\ModelNotFoundException;
use \Henrist\LaravelApiQuery\ApiQueryInterface;

class Daytheme extends \Eloquent implements ApiQueryInterface {

    protected $model_suffix = '';
    protected $table = 'daythemes';

    protected $apiAllowedFields = array('id', 'eventgroup_id', 'title', 'date');
    protected $apiAllowedRelations = array('eventgroup');


    public function eventgroup()
    {
        return $this->belongsTo('\\Blindern\\UKA\\Billett\\Eventgroup'.$this->model_suffix, 'eventgroup_id');
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

