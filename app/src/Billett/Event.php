<?php namespace Blindern\UKA\Billett;

use \Blindern\UKA\Billett\EventGroup;

class Event extends \Eloquent {
	protected $table = 'events';
	protected $appends = array('is_timeout', 'is_old', 'ticket_count');
	// TODO: ticket_count should probably be hidden
	//protected $hidden = array('ticket_count');

	/**
	 * When the online selling freezes (how many seconds before event start)
	 */
	const SELL_TIMEOUT = 3600;

	public function eventGroup()
	{
		return $this->belongsTo('\\Blindern\\UKA\\Billett\\EventGroup', 'group_id');
	}

	public function ticketgroups()
	{
		return $this->hasMany('\\Blindern\\UKA\\Billett\\TicketGroup');
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
				COUNT(IF(t.is_revoked = 0 AND t.used IS NOT NULL, 1, NULL)) count_used
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
			'free' => 0
		);
		foreach ($q as $row) {
			$r[$row->id] = (array)$row;
			$total['valid'] += $row->count_valid;
			$total['pending'] += $row->count_pending;
			$total['expired'] += $row->count_expired;
			$total['revoked'] += $row->count_revoked;
			$total['used'] += $row->count_used;
		}
		$total['free'] = max(0, $this->max_sales - ($total['valid'] + $total['pending']));

		// create ticket group list
		$groups = array();
		foreach ($this->ticketGroups as $group) {
			$g = isset($r[$group->id]) ? $r[$group->id] : null;
			$a = array(
				'valid' => $g ? $g['count_valid'] : 0,
				'pending' => $g ? $g['count_pending'] : 0,
				'expired' => $g ? $g['count_expired'] : 0,
				'revoked' => $g ? $g['count_revoked'] : 0,
				'used' => $g ? $g['count_used'] : 0
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
}
