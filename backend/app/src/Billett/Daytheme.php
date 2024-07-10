<?php

namespace Blindern\UKA\Billett;

use Henrist\LaravelApiQuery\ApiQueryInterface;
use Illuminate\Database\Eloquent\Model;

class Daytheme extends Model implements ApiQueryInterface
{
    protected $model_suffix = '';

    protected $table = 'daythemes';

    protected $apiAllowedFields = ['id', 'eventgroup_id', 'title', 'date'];

    protected $apiAllowedRelations = ['eventgroup'];

    public function eventgroup()
    {
        return $this->belongsTo('\\Blindern\\UKA\\Billett\\Eventgroup'.$this->model_suffix, 'eventgroup_id');
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
