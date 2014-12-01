<?php namespace Blindern\UKA\Billett;

class Ticketgroup extends \Eloquent {
    protected $model_suffix = '';
    protected $table = 'ticketgroups';

    public function getPriceAttribute($val) {
        return (float) $val;
    }

    public function getFeeAttribute($val) {
        return (float) $val;
    }

	public function tickets()
	{
		return $this->hasMany('\\Blindern\\UKA\\Billett\\Ticket'.$this->model_suffix, 'ticketgroup_id');
	}

	public function event()
	{
		return $this->belongsTo('\\Blindern\\UKA\\Billett\\Event'.$this->model_suffix, 'event_id');
	}

    /**
     * Check if there tickets associated that are not expired
     */
    public function getHasTicketsAttribute()
    {
        $res = $this->tickets()->where(function($query) {
            $query->whereNull('expire')->orWhere('expire', '>=', time());
        })->first();

        return (bool) $res;
    }
}
