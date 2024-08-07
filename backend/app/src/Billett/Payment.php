<?php

namespace Blindern\UKA\Billett;

use Henrist\LaravelApiQuery\ApiQueryInterface;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model implements ApiQueryInterface
{
    protected $model_suffix = '';

    protected $table = 'payments';

    protected $hidden = ['data'];

    protected $casts = [
        'is_web' => 'boolean',
    ];

    protected $apiAllowedFields = ['id', 'order_id', 'paymentgroup_id', 'time', 'user_created', 'is_web', 'amount', 'transaction_id', 'status', 'data'];

    protected $apiAllowedRelations = ['order', 'paymentgroup'];

    public function order()
    {
        return $this->belongsTo('\\Blindern\\UKA\\Billett\\Order'.$this->model_suffix, 'order_id');
    }

    public function paymentgroup()
    {
        return $this->belongsTo('\\Blindern\\UKA\\Billett\\Paymentgroup'.$this->model_suffix, 'paymentgroup_id');
    }

    /**
     * Get fields we can search in
     */
    public function getApiAllowedFields(): array
    {
        return $this->apiAllowedFields;
    }

    /**
     * Get fields we can use as relations
     */
    public function getApiAllowedRelations(): array
    {
        return $this->apiAllowedRelations;
    }
}
