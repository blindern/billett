<?php namespace Blindern\UKA\Billett;

use \Carbon\Carbon;
use \iio\libmergepdf\Merger;
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
     * @param array(array(Ticketgroup, int ticket-count), ...)
     * @param bool by ticket office
     */
    public static function createReservation(Eventgroup $eg, $grouplist, $is_admin = false)
    {
        $order = new static();

        $order->eventgroup_id = $eg->id;
        $order->time = time();
        $order->ip = $_SERVER['REMOTE_ADDR'];
        $order->browser = $_SERVER['HTTP_USER_AGENT'];
        $order->is_admin = $is_admin;
        $order->save();
        $order->generateOrderTextId();

        // create and assign the tickets
        foreach ($grouplist as $group) {
            for ($i = 0; $i < $group[1]; $i++) {
                $ticket = new Ticket;
                $ticket->event()->associate($group[0]->event);
                $ticket->ticketgroup()->associate($group[0]);
                $ticket->order()->associate($order);
                if (!$is_admin) {
                    $ticket->expire = time() + static::EXPIRE_INCOMPLETE_RESERVATION;
                }
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

    protected $model_suffix = '';
    protected $table = 'orders';
    //protected $appends = array('total_amount');

    protected $apiAllowedFields = array('id', 'eventgroup_id', 'order_text_id', 'is_valid', 'is_admin', 'time', 'ip', 'browser', 'name', 'email', 'phone', 'recruiter', 'total_amount', 'comment');
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

            $merger = new Merger();
            foreach ($this->tickets as $ticket) {
                $merger->addRaw($ticket->getPdfData());
            }

            $message->attachData($merger->merge(), 'billetter_'.$this->order_text_id.'.pdf', array('mime' => 'application/pdf'));
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

        return true;
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
