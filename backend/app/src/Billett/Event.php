<?php namespace Blindern\UKA\Billett;

use \Blindern\UKA\Billett\Eventgroup;
use \Illuminate\Database\Eloquent\ModelNotFoundException;
use \Henrist\LaravelApiQuery\ApiQueryInterface;

class Event extends \Eloquent implements ApiQueryInterface {
    /**
     * Get a model by its ID or alias and fail if not found
     *
     * @param string id or alias
     * @return static|null
     */
    public static function findByAliasOrFail($id_or_alias)
    {
        $ev = static::find($id_or_alias);
        if (!$ev)
        {
            $ev = static::where('alias', $id_or_alias)->first();
        }

        if (!$ev)
        {
            throw (new ModelNotFoundException)->setModel(get_called_class());
        }

        return $ev;
    }

    protected $model_suffix = '';
    protected $table = 'events';
    protected $appends = array('is_timeout', 'is_old', 'ticket_count', 'has_tickets', 'web_selling_status');
    protected $hidden = array('image');

    protected $apiAllowedFields = array('id', 'eventgroup_id', 'alias', 'is_admin_hidden', 'is_published', 'is_selling', 'time_start',
        'time_end', 'title', 'category', 'location', 'ticket_info', 'selling_text', 'max_each_person', 'max_sales', 'description',
        'description_short', 'ticket_text', 'link', 'age_restriction');
    protected $apiAllowedRelations = array('eventgroup', 'ticketgroups', 'tickets');

    /**
     * When the online selling freezes (how many seconds before event start)
     *
     * Note that this is negative as we currently allow buying tickets
     * after the event has started, to support people coming late to
     * buy online rather than having to pay in person.
     */
    const SELL_TIMEOUT = -3600 * 2;

    public function eventgroup()
    {
        return $this->belongsTo('\\Blindern\\UKA\\Billett\\Eventgroup'.$this->model_suffix, 'eventgroup_id');
    }

    public function ticketgroups()
    {
        return $this->hasMany('\\Blindern\\UKA\\Billett\\Ticketgroup'.$this->model_suffix, 'event_id')->orderBy('order');
    }

    public function tickets()
    {
        return $this->hasMany('\\Blindern\\UKA\\Billett\\Ticket'.$this->model_suffix, 'event_id');
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
     * Check if event has passed start time by some amount
     */
    public function getIsOldAttribute()
    {
        return $this->time_start - static::SELL_TIMEOUT <= time();
    }

    /**
     * Get ticket count information
     */
    public function getTicketCountAttribute()
    {
        // TODO: should be cached somehow (or at least add some indexes to DB)
        $q = \DB::select('
            SELECT g.id,
                g.is_normal,
                COUNT(IF(t.is_valid != 0 AND t.is_revoked = 0, 1, NULL)) count_valid,
                COUNT(IF(t.is_valid = 0 AND t.is_revoked = 0 AND (t.expire IS NULL OR t.expire > ?), 1, NULL)) count_pending,
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
            'free_normal' => 0,
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

            if ($row->is_normal || !$this->max_normal_sales) {
                $total['free_normal'] -= $row->count_valid + $row->count_pending;
            }
        }
        $total['free'] = max(0, $this->max_sales - ($total['valid'] + $total['pending']));
        $total['free_normal'] = max(0, ($this->max_normal_sales ?: $this->max_sales) + $total['free_normal']);

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
            $tf  = $group->is_normal ? $total['free_normal'] : $total['free'];
            $a['free'] = $group->limit == 0 ? $tf : min($tf, $group->limit - ($a['valid'] + $a['pending']));
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
     * @param array(array(ticketgroup, count), ...)
     * @return boolean
     */
    public function checkIsAvailable($groups)
    {
        $total = 0;
        $countinfo = $this->ticket_count;

        // TODO: 'is_normal' field?

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
            $query->whereNull('expire')->orWhere('expire', '>=', time())->orWhere('is_valid', true)->orWhere('is_revoked', true);
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
            if (!$g->use_web) continue;
            $groups++;
        }

        if ($groups == 0)
            return 'no_web_tickets';

        if ($this->is_timeout)
            return 'timeout';

        // TODO: improve check if sold out
        // * total sales reached (event.max_sales - sold - reserved)
        // * or total normal sales reached (event.max_normal_sales - sold(normal) - reserved(normal))
        // * or total sales for all ticketgroups for web reached forall(ticketgroup.limit - sold - reserved)
        $countinfo = $this->ticket_count;
        if ($countinfo['totals']['free_normal'] <= 0)
            return 'sold_out';

        return 'sale';
    }

    /**
     * Get checkin status information
     */
    public function getCheckinAttribute()
    {
        $q = \DB::select('
            SELECT orders.is_admin, tickets.used IS NOT NULL AS is_used, tickets.ticketgroup_id, COUNT(tickets.id) AS count
            FROM tickets JOIN orders ON tickets.order_id = orders.id
            WHERE tickets.event_id = ? AND tickets.is_revoked = 0
            GROUP BY orders.is_admin, tickets.used IS NOT NULL, tickets.ticketgroup_id', [$this->id]);

        $res = [
            'valid' => [
                'total' => 0,
                'admin' => 0,
                'other' => 0,
                'groups' => []
            ],
            'used' => [
                'total' => 0,
                'admin' => 0,
                'other' => 0,
                'groups' => []
            ]
        ];

        $addStats = function(&$arr, $row) {
            $arr['total'] += $row->count;
            $arr[$row->is_admin ? 'admin' : 'other'] += $row->count;

            if (!isset($arr['groups'][$row->ticketgroup_id])) {
                $arr['groups'][$row->ticketgroup_id] = [
                    'total' => 0,
                    'admin' => 0,
                    'other' => 0
                ];
            }

            $arr['groups'][$row->ticketgroup_id]['total'] += $row->count;
            $arr['groups'][$row->ticketgroup_id][$row->is_admin ? 'admin' : 'other'] += $row->count;
        };

        foreach ($q as $row) {
            $addStats($res['valid'], $row);
            if ($row->is_used) {
                $addStats($res['used'], $row);
            }
        }

        return $res;
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
