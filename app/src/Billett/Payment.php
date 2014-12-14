<?php namespace Blindern\UKA\Billett;

use Henrist\LaravelApiQuery\ApiQueryInterface;

class Payment extends \Eloquent implements ApiQueryInterface {
    protected $model_suffix = '';
    protected $table = 'payments';
    protected $hidden = array('data');

    protected $apiAllowedFields = array('id', 'order_id', 'group_id', 'time', 'type', 'amount', 'fee', 'transaction_id', 'status', 'data');
    protected $apiAllowedRelations = array('order', 'paymentgroup');

    public function order()
    {
        return $this->belongsTo('\\Blindern\\UKA\\Billett\\Order'.$this->model_suffix, 'order_id');
    }

    public function paymentgroup()
    {
        return $this->belongsTo('\\Blindern\\UKA\\Billett\\Paymentgroup'.$this->model_suffix, 'group_id');
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
