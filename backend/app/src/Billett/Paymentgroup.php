<?php

namespace Blindern\UKA\Billett;

use Henrist\LaravelApiQuery\ApiQueryInterface;
use Illuminate\Database\Eloquent\Model;

class Paymentgroup extends Model implements ApiQueryInterface
{
    protected $model_suffix = '';

    protected $table = 'paymentgroups';

    protected $apiAllowedFields = ['id', 'eventgroup_id', 'time_start', 'time_end', 'title', 'user_created', 'user_closed'];

    protected $apiAllowedRelations = ['payments', 'eventgroup', 'valid_tickets', 'revoked_tickets', 'paymentsources'];

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
        return $this->hasMany('\\Blindern\\UKA\\Billett\\Ticket'.$this->model_suffix, 'valid_paymentgroup_id');
    }

    public function revoked_tickets()
    {
        return $this->hasMany('\\Blindern\\UKA\\Billett\\Ticket'.$this->model_suffix, 'revoked_paymentgroup_id');
    }

    public function paymentsources()
    {
        return $this->hasMany('\\Blindern\\UKA\\Billett\\Paymentsource'.$this->model_suffix, 'paymentgroup_id');
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
