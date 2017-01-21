<?php namespace Blindern\UKA\Billett;

use Henrist\LaravelApiQuery\ApiQueryInterface;

class Eventgroup extends \Eloquent implements ApiQueryInterface {
    protected $model_suffix = '';
    protected $table = 'eventgroups';

    protected $apiAllowedFields = array('id', 'is_active', 'title', 'sort_value', 'paymentsources_data');
    protected $apiAllowedRelations = array('events', 'orders', 'paymentgroups', 'daythemes');

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

    public function daythemes()
    {
        return $this->hasMany('\\Blindern\\UKA\\Billett\\Daytheme'.$this->model_suffix, 'eventgroup_id');
    }

    public function getPaymentsourcesDataAttribute($val)
    {
        $data = json_decode($val, true);

        // this information might not exist yet
        // we will return a mocked state of the data
        if (!$data) {
            // TODO: need a way for the admin user to easily add and change this
            // TODO: we don't really want to have to mocked... it should always exist?
            $data = array(
                'cash_prefix' => 'D 1910 Kontanter',
                'payments_deviation_prefix' => 'D 1909 Kassedifferanser UKA',
                'orders_deviation_prefix' => 'D 1941 Oppgjørskonto billetter UKA',
                'sources' => array(
                    array('title' => 'D 1940 Oppgjørskonto bet.term. UKA'),
                    array('title' => 'D 1941 Oppgjørskonto billetter UKA'),
                    array('title' => 'D 1942 Oppgjørskonto Vipps UKA'),
                )
            );
        }

        return $data;
    }

    public function setPaymentsourcesDataAttribute($val)
    {
        $this->attributes['paymentsources_data'] = json_encode($val);
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
