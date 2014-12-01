<?php namespace Blindern\UKA\Billett;

use \Blindern\UKA\Billett\Eventgroup;

class Event extends \Eloquent {
	protected $table = 'events';
	protected $appends = array('is_timeout', 'is_old', 'ticket_count', 'has_tickets', 'web_selling_status');
	// TODO: ticket_count should probably be hidden
	//protected $hidden = array('ticket_count');
    protected $hidden = array('image');

	/**
	 * When the online selling freezes (how many seconds before event start)
	 */
	const SELL_TIMEOUT = 3600;

	public function eventgroup()
	{
		return $this->belongsTo('\\Blindern\\UKA\\Billett\\Eventgroup', 'group_id');
	}

	public function ticketgroups()
	{
		return $this->hasMany('\\Blindern\\UKA\\Billett\\Ticketgroup');
	}

	public function tickets()
	{
		return $this->hasMany('\\Blindern\\UKA\\Billett\\Ticket');
	}

	/**
	 * Check if we can sell now to guests now
	 */
	public function getIsTimeoutAttribute()
	{
		return $this->time_start - static::SELL_TIMEOUT <= time();
	}

	/**
	 * Get count of tickets used
	 */
	public function getCountTicketUsed()
	{
		return $this->tickets()->whereNotNull('used')->where('is_revoked', false)->count();
	}

	/**
	 * Check if event has passed start time
	 */
	public function getIsOldAttribute()
	{
		return $this->time_start <= time();
	}

	/**
	 * Get ticket count information
	 */
	public function getTicketCountAttribute()
	{
		// TODO: should be cached somehow (or at least add some indexes to DB)
		$q = \DB::select('
			SELECT g.id,
				COUNT(IF(t.is_valid != 0 AND t.is_revoked = 0, 1, NULL)) count_valid,
				COUNT(IF(t.is_valid = 0 AND t.is_revoked = 0 AND t.expire > ?, 1, NULL)) count_pending,
				COUNT(IF(t.is_valid = 0 AND t.is_revoked = 0 AND t.expire <= ?, 1, NULL)) count_expired,
				COUNT(IF(t.is_valid != 0 AND t.is_revoked != 0, 1, NULL)) count_revoked,
				COUNT(IF(t.is_revoked = 0 AND t.used IS NOT NULL, 1, NULL)) count_used,
				SUM(IF(t.is_valid != 0 AND t.is_revoked = 0, g.price, 0)) sum_price,
				SUM(IF(t.is_valid != 0 AND t.is_revoked = 0, g.fee, 0)) sum_fee
			FROM ticketgroups g JOIN tickets t ON g.id = t.ticketgroup_id
			WHERE g.event_id = ?
			GROUP BY g.id', array(time(), time(), $this->id));

		// save array for later use
		$r = array();
		$total = array(
			'valid' => 0,
			'pending' => 0,
			'expired' => 0,
			'revoked' => 0,
			'used' => 0,
			'free' => 0,
			'sum_price' => 0,
			'sum_fee' => 0
		);
		foreach ($q as $row) {
			$r[$row->id] = (array)$row;
			$total['valid'] += $row->count_valid;
			$total['pending'] += $row->count_pending;
			$total['expired'] += $row->count_expired;
			$total['revoked'] += $row->count_revoked;
			$total['used'] += $row->count_used;
			$total['sum_price'] += $row->sum_price;
			$total['sum_fee'] += $row->sum_fee;
		}
		$total['free'] = max(0, $this->max_sales - ($total['valid'] + $total['pending']));

		// create ticket group list
		$groups = array();
		foreach ($this->ticketgroups as $group) {
			$g = isset($r[$group->id]) ? $r[$group->id] : null;
			$a = array(
				'valid' => $g ? $g['count_valid'] : 0,
				'pending' => $g ? $g['count_pending'] : 0,
				'expired' => $g ? $g['count_expired'] : 0,
				'revoked' => $g ? $g['count_revoked'] : 0,
				'used' => $g ? $g['count_used'] : 0,
				'sum_price' => $g ? $g['sum_price'] : 0,
				'sum_fee' => $g ? $g['sum_fee'] : 0
			);
			$a['free'] = $group->limit == 0 ? $total['free'] : min($total['free'], $group->limit - ($a['valid'] + $a['pending']));
			$groups[$group->id] = $a;
		}

		return array(
			'totals' => $total,
			'groups' => $groups
		);
	}

	/**
     * Check if a list of ticketgroups with ticket count is available
     *
     * The list of groups must be valid for this event
     *
     * @param array(array(group, count), ...)
     */
    public function checkIsAvailable($groups)
    {
    	$total = 0;
    	$countinfo = $this->ticket_count;

    	foreach ($groups as $item) {
    		$group = $item[0];
    		$count = $item[1];

    		if ($count > $countinfo['groups'][$group->id]['free'])
    			return false;
    		$total += $count;
    	}

    	if ($total > $countinfo['totals']['free'])
    		return false;

    	return true;
    }

    /**
     * Check if there are tickets for this event
     *
     * Mainly used to determine wheter the event can be deleted or not
     */
    public function getHasTicketsAttribute()
    {
        // revoked tickets are counted as positive match
        $res = $this->tickets()->where(function($query) {
            $query->whereNull('expire')->orWhere('expire', '>=', time());
        })->first();

        return (bool) $res;
    }

    /**
     * Get selling status for the event
     *
     * This is used for web tickets only
     */
    public function getWebSellingStatusAttribute()
    {
        if (!$this->is_selling)
            return 'unknown';

        if ($this->max_sales == 0)
            return 'no_tickets';

        if ($this->is_old)
            return 'old';

        // TODO: optimize this (!)
        $groups = 0;
        foreach ($this->ticketgroups as $g) {
            if (!$g->is_active || !$g->is_published) continue;
            $groups++;
        }

        if ($groups == 0)
            return 'no_web_tickets';

        if ($this->is_timeout)
            return 'timeout';

        // TODO: check if sold out
        // * total sales reached (event.max_sales - sold - reserved)
        // * or total normal sales reached (event.max_normal_sales - sold(normal) - reserved(normal))
        // * or total sales for all ticketgroups for web reached forall(ticketgroup.limit - sold - reserved)
        // if (...)
        //     return 'sold_out';

        return 'sale';
    }
}
