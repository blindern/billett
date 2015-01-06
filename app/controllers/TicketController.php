<?php

use Blindern\UKA\Billett\Ticket;

class TicketController extends \Controller {
    public function __construct()
    {
        $this->beforeFilter('auth');
    }

    public function index()
    {
        return \ApiQuery::processCollection(Ticket::query());
    }

    public function pdf($id)
    {
        $ticket = Ticket::findOrFail($id);
        return Response::make($ticket->getPdfData(), 200, array(
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="'.$ticket->getPdfName().'"'
        ));
    }
}
