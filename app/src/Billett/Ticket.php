<?php namespace Blindern\UKA\Billett;

use Blindern\UKA\Billett\Helpers\PdfTicket;

class Ticket extends \Eloquent {
    protected $table = 'tickets';
    protected $appends = array('number');
    protected $hidden = array('pdf');

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
    public function getPdfData($regenerate = false)
    {
        if (!$this->pdf || $regenerate)
        {
            $p = new PdfTicket($this);
            $this->pdf = $p->getPdfData();
            $this->save();
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
}
