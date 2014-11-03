<?php namespace Blindern\UKA\Billett;

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
     * @param array(array(TicketGroup, int ticket-count), ...)
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
                $ticket->ticketGroup()->associate($group[0]);
                $ticket->order()->associate($order);

                // TODO: do we need expire field?
                //$ticket->expire = time() + EXPIRE_INCOMPLETE_RESERVATION;
                $ticket->save();
            }
        }

        return $order;
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
        // TODO
    }

    /**
     * Check if order is a reservation
     */
    public function isReservation()
    {
        return !$this->isCompleted();
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
        $tickets = $this->tickets()->with('ticketGroup')->get();

        $amount = 0;
        foreach ($tickets as $ticket) {
            $amount += $ticket->ticketGroup->price + $ticket->ticketGroup->fee;
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

}
