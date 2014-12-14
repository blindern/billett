<?php namespace Henrist\LaravelApiQuery;

interface ApiQueryInterface {
    /**
     * Get fields we can use in filtering and selecting
     *
     * @return array
     */
    public function getApiAllowedFields();

    /**
     * Get fields we can use as relations
     *
     * @return array
     */
    public function getApiAllowedRelations();
}
