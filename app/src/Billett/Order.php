<?php namespace Blindern\UKA\Billett;

use \Carbon\Carbon;

class Order extends \Eloquent {
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
     * @param array(array(Ticketgroup, int ticket-count), ...)
     */
    public static function createReservation($grouplist)
    {
        $order = new static();

        $order->time = time();
        $order->ip = $_SERVER['REMOTE_ADDR'];
        $order->browser = $_SERVER['HTTP_USER_AGENT'];
        $order->save();
        $order->generateOrderTextId();

        // store in session so we know which orders belong to this user
        $orders = \Session::get('billett_reservations', array());
        $orders[] = $order->id;
        \Session::put('billett_reservations', $orders);

        // create and assign the tickets
        foreach ($grouplist as $group) {
            for ($i = 0; $i < $group[1]; $i++) {
                $ticket = new Ticket;
                $ticket->event()->associate($group[0]->event);
                $ticket->ticketgroup()->associate($group[0]);
                $ticket->order()->associate($order);
                $ticket->expire = time() + static::EXPIRE_INCOMPLETE_RESERVATION;
                $ticket->save();
            }
        }

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

	protected $table = 'orders';
    protected $appends = array('total_amount');

	public function tickets()
	{
		return $this->hasMany('\\Blindern\\UKA\\Billett\\Ticket');
	}

	public function payments()
	{
		return $this->hasMany('\\Blindern\\UKA\\Billett\\Payment');
	}

    /**
     * Send tickets and receipt to email
     */
    public function sendEmail()
    {
        \Mail::send(array('text' => 'billett.email_order'), array('order' => $this), function($message)
        {
            $ticket = $this->tickets->first();
            $ticketinfo = $ticket ? " - ".$ticket->event->title." (".Carbon::createFromTimeStamp($ticket->event->time_start)->format('d.m.Y').")" : '';

            $message->to($this->email, $this->name);
            $message->subject('Billett'.(count($this->tickets) == 1 ? '' : 'er').' UKA på Blindern #'.$this->order_text_id.$ticketinfo);

            foreach ($this->tickets as $ticket) {
                $message->attachData($ticket->getPdfData(), $ticket->getPdfName(), array('mime' => 'application/pdf'));
            }
        });
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
        if (!$this->isReservation()) return false;
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

        // TODO: some transaction stuff here?

        foreach ($this->tickets()->get() as $ticket) {
            $ticket->delete();
        }

        $this->delete();
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
        $orderid = $d->format("y").str_pad($d->format("z"), 3, "0", STR_PAD_LEFT).str_pad($this->id, 4, "0", STR_PAD_LEFT).(\Config::get('app.debug') ? '-TEST' : '');

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
            $ticket->expire = time() + $this->getExpireDelay();
            $ticket->save();
        }

        $this->time = time();
        $this->save();

        return true;
    }

    /**
     * Check if we can renew the order
     *
     * @return boolean
     */
    public function canRenew()
    {
        if (!$this->isReservation()) throw new \Exception("The order is not a reservation");

        if (!$this->hasExpired()) return true;

        // check if the tickets are available
        $groups = array();
        $event = null;
        foreach ($this->tickets()->with('ticketgroup', 'event')->get() as $ticket) {
            if (!isset($groups[$ticket->ticketgroup->id])) {
                $groups[$ticket->ticketgroup->id] = array($ticket->ticketgroup, 0);
            }
            $groups[$ticket->ticketgroup->id][1]++;
            if (!$event) $event = $ticket->event;
        }

        if (!$event->checkIsAvailable($groups)) {
            return false;
        }

        return true;
    }

    /**
     * Mark order as complete
     */
    public function markComplete()
    {
        if ($this->isCompleted()) throw new \Exception("The order is already marked complete");

        if (!$this->canRenew()) return false;

        foreach ($this->tickets as $ticket) {
            $ticket->setValid();
            $ticket->save();
        }

        $this->time = time();
        $this->is_valid = true;
        $this->save();
    }

}
