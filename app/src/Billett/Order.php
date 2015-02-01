<?php namespace Blindern\UKA\Billett;

use \Carbon\Carbon;
use \Henrist\LaravelApiQuery\ApiQueryInterface;

class Order extends \Eloquent implements ApiQueryInterface {
    /**
     * How long a incomplete reservation is valid
     */
    const EXPIRE_INCOMPLETE_RESERVATION = 600;

    /**
     * How long a reservation that is sent to payment is valid
     */
    const EXPIRE_LOCKED_RESERVATION = 1800;

    /**
     * Create reservation
     *
     * @param Eventgroup $eg
     * @param array(array(Ticketgroup, int ticket-count), ...)
     * @param bool by ticket office
     * @return Order
     */
    public static function createReservation(Eventgroup $eg, $is_admin = false)
    {
        $order = new static();

        $order->eventgroup()->associate($eg);
        $order->time = time();
        $order->ip = $_SERVER['REMOTE_ADDR'];
        $order->browser = $_SERVER['HTTP_USER_AGENT'];
        $order->is_admin = $is_admin;
        $order->save();
        $order->generateOrderTextId();

        return $order;
    }

    /**
     * Find order by text id or fail
     */
    public static function findByTextIdOrFail($text_id)
    {
        if (empty($text_id))
        {
            throw new \ModelNotFoundException('Missing text id');
        }

        return static::where('order_text_id', $text_id)->firstOrFail();
    }

    /**
     * Get query for expired reservations
     */
    public static function expiredReservations()
    {
        return static::where('is_valid', false)->where('is_admin', false)->where(function ($q) {
            $q->where('is_locked', true)->where('time', '<', time() - static::EXPIRE_LOCKED_RESERVATION);
        })->orWhere(function ($q) {
            $q->where('is_locked', false)->where('time', '<', time() - static::EXPIRE_INCOMPLETE_RESERVATION);
        });
    }

    /**
     * Refresh all orders balances
     */
    public static function refreshBalances($order_id = null)
    {
        $p = $order_id ? [$order_id, $order_id] : [];

        \DB::statement("
            UPDATE
                orders, (
                    SELECT order_id, SUM(amount) amount
                    FROM
                        (
                            SELECT t.order_id, -IFNULL(g.price, 0) - IFNULL(g.fee, 0) AS amount
                            FROM tickets t JOIN ticketgroups g ON t.ticketgroup_id = g.id
                            WHERE ".($order_id ? "t.order_id = ? AND " : "")."t.is_valid = 1 AND t.is_revoked = 0
                            UNION ALL
                            SELECT order_id, amount AS amount
                            FROM payments
                            ".($order_id ? "WHERE t.order_id = ?" : "")."
                        ) ref
                    GROUP BY order_id
                ) amounts
            SET orders.balance = amounts.amount
            WHERE orders.id = amounts.order_id", $p);
    }

    protected $model_suffix = '';
    protected $table = 'orders';
    //protected $appends = array('total_amount');

    protected $apiAllowedFields = array('id', 'eventgroup_id', 'order_text_id', 'is_valid', 'is_admin', 'time', 'ip', 'browser', 'name', 'email', 'phone', 'recruiter', 'total_amount', 'comment', 'balance');
    protected $apiAllowedRelations = array('eventgroup', 'tickets', 'payments');

    public function eventgroup()
    {
        return $this->belongsTo('\\Blindern\\UKA\\Billett\\Eventgroup'.$this->model_suffix, 'eventgroup_id');
    }

    public function tickets()
    {
        return $this->hasMany('\\Blindern\\UKA\\Billett\\Ticket'.$this->model_suffix, 'order_id');
    }

    public function payments()
    {
        return $this->hasMany('\\Blindern\\UKA\\Billett\\Payment'.$this->model_suffix, 'order_id');
    }

    /**
     * Send tickets and receipt to email when online web order has been completed (paid)
     */
    public function sendEmailOrderWebComplete()
    {
        $events = $this->getEvents();

        \Mail::send(array('text' => 'billett.email_order_web_complete'), array('order' => $this), function($message) use ($events)
        {
            $event = count($events) == 1 ? $events[0] : null;
            $eventinfo = $event ? " - ".$event->title." (".Carbon::createFromTimeStamp($event->time_start)->format('d.m.Y').")" : '';

            $message->to($this->email, $this->name ?: null);
            $message->subject('Billett'.(count($this->tickets) == 1 ? '' : 'er').' UKA på Blindern #'.$this->order_text_id.$eventinfo);

            $message->attachData($this->generateTicketsPdf(), 'billetter_'.$this->order_text_id.'.pdf', array('mime' => 'application/pdf'));
        });
    }

    /**
     * Send orderdetails to email
     *
     * @param string $email Override email address
     * @param string $text Text to write in the email
     * @throws \Exception
     */
    public function sendEmail($email = null, $text = null)
    {
        $name = $this->name ?: null;
        if (empty($email)) {
            if (empty($this->email)) {
                throw new \Exception("Cannot send email without receiver");
            }
            $email = $this->email;
            $name = null;
        }

        \Mail::send(array('text' => 'billett.email_order_details'), array('order' => $this, 'text' => $text), function($message) use ($email, $name, $text)
        {
            $events = $this->getEvents();
            $event = count($events) == 1 ? $events[0] : null;
            $eventinfo = $event ? " - ".$event->title." (".Carbon::createFromTimeStamp($event->time_start)->format('d.m.Y').")" : '';

            $has_valid_tickets = false;
            foreach ($this->tickets as $ticket) {
                if ($ticket->is_valid && !$ticket->is_revoked) {
                    $has_valid_tickets = true;
                    break;
                }
            }

            $subj = $has_valid_tickets ? 'Billett'.(count($this->tickets) == 1 ? '' : 'er') : 'Ordredetaljer';

            $message->to($email, $name);
            $message->subject($subj.' UKA på Blindern #'.$this->order_text_id.$eventinfo);

            if (!empty($text)) {
                // TODO: move email to eventgroup data
                $message->bcc(\Config::get('dibs.test') ? 'admin@blindernuka.no' : 'billett@blindernuka.no');
            }

            if ($has_valid_tickets) {
                $message->attachData($this->generateTicketsPdf(), 'billetter_'.$this->order_text_id.'.pdf', array('mime' => 'application/pdf'));
            }
        });
    }

    /**
     * Generate PDF with all valid tickets
     */
    public function generateTicketsPdf()
    {
        return Ticket::generateTicketsPdf(array_filter($this->tickets->all(), function ($ticket) {
            return $ticket->is_valid && !$ticket->is_revoked;
        }));
    }

    /**
     * Get list of events this order is referenced with
     */
    public function getEvents()
    {
        $this->load('tickets.event');
        return array_reduce($this->tickets->all(), function ($prev, $ticket) {
            if (!in_array($ticket->event, $prev)) $prev[] = $ticket->event;
            return $prev;
        }, []);
    }

    /**
     * Check if order is a reservation
     */
    public function isReservation()
    {
        return !$this->isCompleted();
    }

    /**
     * Check if reservation has expired
     */
    public function hasExpired()
    {
        if (!$this->isReservation() || $this->is_admin) return false;
        return time() > $this->time + $this->getExpireDelay();
    }

    /**
     * Get count of seconds for the expiration
     */
    public function getExpireDelay()
    {
        return ($this->isReservationLocked()
                ? static::EXPIRE_LOCKED_RESERVATION
                : static::EXPIRE_INCOMPLETE_RESERVATION);
    }

    /**
     * Check if order has completed (valid order)
     */
    public function isCompleted()
    {
        return $this->is_valid == true;
    }

    /**
     * Validate ownership to reservation
     *
     * When the reservation is created, the ID is stored to the session
     */
    public function isOwnerOfReservation()
    {
        $orders = \Session::get('billett_reservations', array());
        foreach ($orders as $order_id) {
            if ($order_id == $this->id)
                return true;
        }
        return false;
    }

    /**
     * Check if reservation is locked for changes
     */
    public function isReservationLocked()
    {
        return $this->is_locked == true;
    }

    /**
     * Calculate total price for order
     */
    public function getTotalAmount()
    {
        $tickets = $this->tickets()->with('ticketgroup')->get();

        $amount = 0;
        foreach ($tickets as $ticket) {
            if ($ticket->is_revoked) continue;
            $amount += $ticket->ticketgroup->price + $ticket->ticketgroup->fee;
        }

        return $amount;
    }

    public function getTotalAmountAttribute() {
        return $this->getTotalAmount();
    }

    /**
     * Delete reservation
     *
     * Will also delete associated tickets
     */
    public function deleteReservation()
    {
        if ($this->isCompleted()) {
            throw new Exception("Trying to delete a order that is completed!");
        }

        \DB::transaction(function() {
            foreach ($this->tickets()->get() as $ticket) {
                $ticket->delete();
            }

            $this->delete();
        });

        return true;
    }

    /**
     * Generate order text-ID
     */
    protected function generateOrderTextId()
    {
        if ($this->order_text_id != null) {
            throw new Exception("Trying to create new order text-id, but it exists already!");
        }

        $d = \Carbon\Carbon::createFromTimeStamp($this->time);
        $orderid = $d->format("y").str_pad($d->format("z"), 3, "0", STR_PAD_LEFT).str_pad($this->id, 4, "0", STR_PAD_LEFT).(\Config::get('dibs.test') ? '-TEST' : '');

        $this->order_text_id = $orderid;
        $this->save();
    }

    /**
     * Try to mark reservation as in pay mode
     */
    public function placeOrder()
    {
        if ($this->isCompleted()) return false;
        if (empty($this->name) || empty($this->email) || empty($this->phone)) return false;

        if (!$this->isReservationLocked()) {
            $this->is_locked = true;
            $this->save();
        }

        $this->renew();

        return true;
    }

    /**
     * Update time for reservation
     *
     * Will check if still valid
     */
    public function renew()
    {
        if (!$this->canRenew()) {
            return false;
        }

        foreach ($this->tickets as $ticket) {
            if ($ticket->expire) {
                $ticket->expire = time() + $this->getExpireDelay();
                $ticket->save();
            }
        }

        // don't update admin reservations, as they will never expire
        if (!$this->is_admin) {
            $this->time = time();
            $this->save();
        }

        return true;
    }

    /**
     * Check if we can renew the order
     *
     * @throws \Exception
     * @return boolean
     */
    public function canRenew()
    {
        if (!$this->isReservation()) throw new \Exception("The order is not a reservation");

        if (!$this->hasExpired()) return true;

        // check if the tickets are still available
        $groups = [];
        foreach ($this->tickets()->where('is_valid', 0)->with('ticketgroup', 'event')->get() as $ticket) {
            if (!isset($groups[$ticket->ticketgroup->id])) {
                $groups[$ticket->ticketgroup->id] = array($ticket->ticketgroup, 0);
            }
            $groups[$ticket->ticketgroup->id][1]++;
        }

        if (!Ticketgroup::checkIsAvailable($groups)) {
            return false;
        }

        return true;
    }

    /**
     * Mark order as complete, in practise changing from reservation to actual order
     *
     * @param bool         $skip_tickets Skip convertion of tickets reserved
     * @param Paymentgroup $paymentgroup Paymentgroup to associate validated tickets
     * @return bool If success
     * @throws \Exception
     */
    public function markComplete($skip_tickets = null, $paymentgroup = null)
    {
        if ($this->isCompleted()) throw new \Exception("The order is already marked complete");

        if (!$this->canRenew()) return false;

        if (!$skip_tickets) {
            foreach ($this->tickets as $ticket) {
                if (!$ticket->is_valid) {
                    if (!isset($ticket->order)) {
                        $ticket->setRelation('order', $this);
                    }
                    $ticket->setValid($paymentgroup);
                }
            }
        }

        $this->time = time();
        $this->is_valid = true;
        $this->save();

        return true;
    }

    /**
     * Create and attach tickets (tickets will be saved)
     *
     * @param array list of [Ticketgroup, count] representing each new ticketgroup and number of tickets, eager load of event is preferred
     * @return array list of Ticket, the new tickets created
     */
    public function createTickets(array $ticketgroups)
    {
        $tickets = [];
        foreach ($ticketgroups as $row) {
            for ($i = 0; $i < $row[1]; $i++) {
                $ticket = new Ticket;
                $ticket->event()->associate($row[0]->event);
                $ticket->ticketgroup()->associate($row[0]);
                $ticket->order()->associate($this);
                $ticket->time = time();

                if (!$this->is_admin) {
                    $ticket->expire = time() + static::EXPIRE_INCOMPLETE_RESERVATION;
                }

                $ticket->save();
                $tickets[] = $ticket;
            }
        }

        return $tickets;
    }

    /**
     * Hard refresh of balance
     */
    public function refreshBalance() {
        static::refreshBalances($this->id);

        $this->balance = \DB::table('orders')->where('id', $this->id)->pluck('balance');
    }

    /**
     * Modify balance
     */
    public function modifyBalance($amount)
    {
        $this->balance += $amount;

        // make sure we have no races
        \DB::statement('
            UPDATE orders
            SET balance = balance + ?
            WHERE id = ?', [$amount, $this->id]);
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
