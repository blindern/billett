<?php namespace Blindern\UKA\Billett;

use Henrist\LaravelApiQuery\ApiQueryInterface;

class Eventgroup extends \Eloquent implements ApiQueryInterface {
    protected $model_suffix = '';
    protected $table = 'eventgroups';

    protected $apiAllowedFields = array('id', 'is_active', 'title', 'sort_value');
    protected $apiAllowedRelations = array('events', 'orders', 'paymentgroups');

    public function events()
    {
        return $this->hasMany('\\Blindern\\UKA\\Billett\\Event'.$this->model_suffix, 'eventgroup_id');
    }

    public function orders()
    {
        return $this->hasMany('\\Blindern\\UKA\\Billett\\Order'.$this->model_suffix, 'eventgroup_id');
    }

    public function paymentgroups()
    {
        return $this->hasMany('\\Blindern\\UKA\\Billett\\Paymentgroup'.$this->model_suffix, 'eventgroup_id');
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
