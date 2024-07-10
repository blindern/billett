<?php

namespace Blindern\UKA\Billett;

use Henrist\LaravelApiQuery\ApiQueryInterface;
use Illuminate\Database\Eloquent\Model;

class Paymentsource extends Model implements ApiQueryInterface
{
    protected $model_suffix = '';

    protected $table = 'paymentsources';

    protected $apiAllowedFields = ['id', 'paymentgroup_id', 'is_deleted', 'time_created', 'time_deleted', 'user_created', 'user_deleted', 'type', 'title', 'comment', 'amount', 'data'];

    protected $apiAllowedRelations = ['paymentgroup'];

    public function paymentgroup()
    {
        return $this->belongsTo('\\Blindern\\UKA\\Billett\\Paymentgroup'.$this->model_suffix, 'paymentgroup_id');
    }

    public function getDataAttribute($val)
    {
        return json_decode($val, true);
    }

    public function setDataAttribute($val)
    {
        $this->attributes['data'] = json_encode($val);
    }

    public function getAmountAttribute($val)
    {
        return (float) $val;
    }

    /**
     * Get fields we can search in
     */
    public function getApiAllowedFields()
    {
        return $this->apiAllowedFields;
    }

    /**
     * Get fields we can use as relations
     */
    public function getApiAllowedRelations()
    {
        return $this->apiAllowedRelations;
    }
}
