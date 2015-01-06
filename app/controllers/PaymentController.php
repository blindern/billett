<?php

use Blindern\UKA\Billett\Payment;

class PaymentController extends \Controller {
    public function __construct()
    {
        $this->beforeFilter('auth');
    }

    public function index()
    {
        return \ApiQuery::processCollection(Payment::query());
    }
}
