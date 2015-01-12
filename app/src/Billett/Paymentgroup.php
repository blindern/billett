<?php namespace Blindern\UKA\Billett;

use Henrist\LaravelApiQuery\ApiQueryInterface;

class Paymentgroup extends \Eloquent implements ApiQueryInterface {
    protected $model_suffix = '';
    protected $table = 'paymentgroups';

    protected $apiAllowedFields = array('id', 'eventgroup_id', 'time_start', 'time_end', 'title', 'user_created', 'user_closed');
    protected $apiAllowedRelations = array('payments', 'eventgroup', 'valid_tickets', 'revoked_tickets');

    public function payments()
    {
        return $this->hasMany('\\Blindern\\UKA\\Billett\\Payment'.$this->model_suffix, 'paymentgroup_id');
    }

    public function eventgroup()
    {
        return $this->belongsTo('\\Blindern\\UKA\\Billett\\Eventgroup'.$this->model_suffix, 'eventgroup_id');
    }

    public function valid_tickets()
    {
        // this will list tickets that was assign to this paymentgroup when it was made valid, but it might be revoked now
        return $this->belongsTo('\\Blindern\\UKA\\Billett\\Ticket'.$this->model_suffix, 'valid_paymentgroup_id');
    }

    public function revoked_tickets()
    {
        return $this->belongsTo('\\Blindern\\UKA\\Billett\\Ticket'.$this->model_suffix, 'revoked_paymentgroup_id');
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
