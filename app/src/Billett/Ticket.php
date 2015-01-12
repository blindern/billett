<?php namespace Blindern\UKA\Billett;

use Blindern\UKA\Billett\Helpers\PdfTicket;
use Henrist\LaravelApiQuery\ApiQueryInterface;

class Ticket extends \Eloquent implements ApiQueryInterface {
    /**
     * Get sold stats
     */
    public static function getStats($eventgroup_id)
    {
        $q = \DB::select('
            SELECT day, ticketgroup_id, event_id, CAST(SUM(num_tickets) AS UNSIGNED) num_tickets, CAST(SUM(num_revoked) AS UNSIGNED) num_revoked
            FROM (
                SELECT DATE(FROM_UNIXTIME(t.time)) day, ticketgroup_id, event_id,
                  COUNT(t.id) num_tickets,
                  0 num_revoked
                FROM tickets t
                  JOIN events e ON t.event_id = e.id
                WHERE t.is_valid = 1 AND e.group_id = ?
                GROUP BY DATE(FROM_UNIXTIME(t.time)), ticketgroup_id, event_id

                UNION ALL

                SELECT DATE(FROM_UNIXTIME(t.time_revoked)) day, ticketgroup_id, event_id,
                  0 num_tickets,
                  COUNT(t.id) num_revoked
                FROM tickets t
                  JOIN events e ON t.event_id = e.id
                WHERE t.is_revoked = 1 AND e.group_id = ?
                GROUP BY DATE(FROM_UNIXTIME(t.time)), ticketgroup_id, event_id
            ) ref
            GROUP BY day, ticketgroup_id, event_id', array($eventgroup_id, $eventgroup_id));

        $ticketgroups = array();
        $events = array();

        foreach ($q as $row) {
            if (!in_array($row->ticketgroup_id, $ticketgroups)) $ticketgroups[] = $row->ticketgroup_id;
            if (!in_array($row->event_id, $events)) $events[] = $row->event_id;
        }

        if (count($ticketgroups) > 0) {
            $qs = implode(",", array_fill(0, count($ticketgroups), "?"));
            $ticketgroups = \DB::select("
                SELECT id, title, price, fee, event_id
                FROM ticketgroups
                WHERE id IN ($qs)", $ticketgroups);
        }

        if (count($events) > 0) {
            $qs = implode(",", array_fill(0, count($events), "?"));
            $events = \DB::select("
                SELECT id, title, time_start, category
                FROM events
                WHERE id IN ($qs)
                ORDER BY time_start", $events);
        }

        return array(
            'tickets' => $q,
            'ticketgroups' => $ticketgroups,
            'events' => $events
        );
    }

    protected $table = 'tickets';
    protected $appends = array('number');
    protected $hidden = array('pdf');

    protected $apiAllowedFields = array('id', 'order_id', 'event_id', 'ticketgroup_id', 'time', 'expire', 'is_valid', 'is_revoked', 'used', 'key');
    protected $apiAllowedRelations = array('event', 'order', 'ticketgroup', 'valid_paymentgroup', 'revoked_paymentgroup');

    public function event()
    {
        return $this->belongsTo('\\Blindern\\UKA\\Billett\\Event'.$this->model_suffix, 'event_id');
    }

    public function order()
    {
        return $this->belongsTo('\\Blindern\\UKA\\Billett\\Order'.$this->model_suffix, 'order_id');
    }

    public function ticketgroup()
    {
        return $this->belongsTo('\\Blindern\\UKA\\Billett\\Ticketgroup'.$this->model_suffix, 'ticketgroup_id');
    }

    public function valid_paymentgroup()
    {
        return $this->belongsTo('\\Blindern\\UKA\\Billett\\Paymentgroup'.$this->model_suffix, 'valid_paymentgroup_id');
    }

    public function revoked_paymentgroup()
    {
        return $this->belongsTo('\\Blindern\\UKA\\Billett\\Paymentgroup'.$this->model_suffix, 'revoked_paymentgroup_id');
    }

    public function getKeyAttribute($key)
    {
        if ($key == "") {
            $key = $this->generateKey();
            $this->key = $key;
            $this->save();
        }

        return $key;
    }

    /**
     * Generate a unique ticket key used for barcode
     *
     * @return string ticket key
     */
    public static function generateKey()
    {
        // keys consists of 6 numbers zeropadded
        do
        {
            $key = str_pad(rand(1, 999999), 6, "0", STR_PAD_LEFT);

            // check if it exists
            $ticket = Ticket::where('key', $key)->first();
        } while ($ticket); // if we have ticket we failed; retry

        return $key;
    }

    /**
     * Get (generate if neeed) PDF data
     *
     * @param bool Regenerate PDF?
     * @return binary
     */
    public function getPdfData($regenerate = false, $store = true)
    {
        if (!$this->pdf || $regenerate)
        {
            $p = new PdfTicket($this);
            $this->pdf = $p->getPdfData();
            if ($store) $this->save();
        }

        return $this->pdf;
    }

    /**
     * Get name for PDF-file
     *
     * @return string
     */
    public function getPdfName()
    {
        $n = str_pad($this->id, 4, '0', STR_PAD_LEFT);
        return 'billett_blindernuka_'.$n.'.pdf';
    }

    /**
     * Get the ticket number (zero-padded ID)
     *
     * @return string
     */
    public function getNumberAttribute()
    {
        return str_pad($this->id, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Set ticket valid
     */
    public function setValid()
    {
        $this->is_valid = true;
        $this->expire = null;
        $this->time = time();
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
