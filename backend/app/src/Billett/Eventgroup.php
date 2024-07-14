<?php

namespace Blindern\UKA\Billett;

use Henrist\LaravelApiQuery\ApiQueryInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Eventgroup extends Model implements ApiQueryInterface
{
    protected $model_suffix = '';

    protected $table = 'eventgroups';

    protected $casts = [
        'is_active' => 'boolean',
    ];

    protected $apiAllowedFields = ['id', 'is_active', 'title', 'sort_value', 'paymentsources_data'];

    protected $apiAllowedRelations = ['events', 'orders', 'paymentgroups', 'daythemes'];

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
        if (! $data) {
            // TODO: need a way for the admin user to easily add and change this
            // TODO: we don't really want to have to mocked... it should always exist?
            $data = [
                'cash_prefix' => 'D 1910 Kontanter',
                'payments_deviation_prefix' => 'D 1909 Kassedifferanser UKA',
                'orders_deviation_prefix' => 'D 1941 Oppgjørskonto billetter UKA',
                'sources' => [
                    ['title' => 'D 1940 Oppgjørskonto bet.term. UKA'],
                    ['title' => 'D 1941 Oppgjørskonto billetter UKA'],
                    ['title' => 'D 1942 Oppgjørskonto Vipps UKA'],
                ],
            ];
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

    /**
     * Get list of tickets with recruiter details
     */
    public function getRecruiterList()
    {
        $q = DB::select('
            SELECT
                tickets.id ticket_id,
                orders.order_text_id, orders.id order_id, FROM_UNIXTIME(orders.time) order_time,
                orders.is_admin order_is_admin, orders.name order_name, orders.recruiter order_recruiter,
                events.id event_id, FROM_UNIXTIME(events.time_start) event_time_start, events.title event_title,
                events.category event_category,
                ticketgroups.price ticketgroup_price, ticketgroups.title ticketgroup_title
            FROM orders
                JOIN tickets ON tickets.order_id = orders.id AND tickets.is_valid = 1 AND tickets.is_revoked = 0
                JOIN ticketgroups ON ticketgroups.id = tickets.ticketgroup_id
                JOIN events ON events.id = tickets.event_id
            WHERE events.eventgroup_id = ? AND orders.recruiter IS NOT NULL AND orders.recruiter != ""
            ORDER BY orders.time DESC', [$this->id]);

        return $q;
    }
}
