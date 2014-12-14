<?php namespace Blindern\UKA\Billett;

use Henrist\LaravelApiQuery\ApiQueryInterface;

class Paymentgroup extends \Eloquent implements ApiQueryInterface {
    protected $model_suffix = '';
    protected $table = 'paymentgroups';

    protected $apiAllowedFields = array('id', 'time_start', 'time_end', 'title');
    protected $apiAllowedRelations = array('payments');

    public function payments()
    {
        return $this->hasMany('\\Blindern\\UKA\\Billett\\Payment'.$this->model_suffix, 'paymentgroup_id');
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
