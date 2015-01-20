<?php

use Blindern\UKA\Billett\Ticket;
use Blindern\UKA\Billett\Paymentgroup;
use Blindern\UKA\Billett\Printer;

class TicketController extends \Controller {
    public function __construct()
    {
        $this->beforeFilter('auth');
    }

    public function index()
    {
        return \ApiQuery::processCollection(Ticket::query());
    }

    /**
     * Delete a ticket
     *
     * The ticket must be a reservation to be deleted
     */
    public function destroy($id)
    {
        $ticket = Ticket::findOrFail($id);

        if ($ticket->is_valid) {
            return Response::json('Ticket is not a reservation', 400);
        }

        $ticket->delete();
        return Response::json(array('result' => 'deleted'));
    }

    /**
     * Retrive merged PDF of multiple tickets
     */
    public function mergedPDF()
    {
        $tickets = $this->getTicketsByIds();
        if (is_object($tickets)) {
            return $tickets;
        }

        return Response::make(Ticket::generateTicketsPdf($tickets), 200, array(
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="tickets.pdf"'
        ));
    }

    /**
     * Print a merged PDF
     */
    public function printMergedPdf($printername)
    {
        $tickets = $this->getTicketsByIds();
        if (is_object($tickets)) {
            return $tickets;
        }

        $printer = Printer::find($printername);
        if (!$printer) {
            return \Response::json('unknown printer', 400);
        }

        if ($printer->printPdf(Ticket::generateTicketsPdf($tickets))) {
            return \Response::json('OK');
        } else {
            return \Response::json('Print failed', 503);
        }
    }

    /**
     * Retrieve PDF for the ticket
     */
    public function pdf($id)
    {
        $ticket = Ticket::findOrFail($id);
        return Response::make($ticket->getPdfData(), 200, array(
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="'.$ticket->getPdfName().'"'
        ));
    }

    /**
     * Print a specific ticket
     */
    public function printTicket($id, $printername)
    {
        $ticket = Ticket::findOrFail($id);

        $printer = Printer::find($printername);
        if (!$printer) {
            return \Response::json('unknown printer', 400);
        }

        if ($printer->printPdf($ticket->getPdfData())) {
            return \Response::json('OK');
        } else {
            return \Response::json('Print failed', 503);
        }
    }

    /**
     * Revoke a ticket
     */
    public function revoke($id)
    {
        $ticket = Ticket::findOrFail($id);

        if (!Input::has('paymentgroup_id')) {
            return Response::json('missing paymentgroup', 400);
        }

        if (!$ticket->is_valid) {
            return Response::json('ticket is not valid', 400);
        }

        if ($ticket->is_revoked) {
            return $ticket;
        }

        $paymentgroup = Paymentgroup::find(Input::get('paymentgroup_id'));
        if (!$paymentgroup || $paymentgroup->eventgroup_id != $ticket->event->eventgroup->id) {
            return Response::json('paymentgroup not found', 400);
        }

        if ($paymentgroup->time_end) {
            return Response::json('paymentgroup is closed', 400);
        }

        $ticket->setRevoked($paymentgroup);
    }

    /**
     * Set a ticket valid (and assign to paymentgroup)
     */
    public function validate($id)
    {
        $ticket = Ticket::findOrFail($id);

        if (!Input::has('paymentgroup_id')) {
            return Response::json('missing paymentgroup', 400);
        }

        if ($ticket->is_valid) {
            return $ticket;
        }

        $paymentgroup = Paymentgroup::find(Input::get('paymentgroup_id'));
        if (!$paymentgroup || $paymentgroup->eventgroup_id != $ticket->event->eventgroup->id) {
            return Response::json('paymentgroup not found', 400);
        }

        if ($paymentgroup->time_end) {
            return Response::json('paymentgroup is closed', 400);
        }

        $ticket->setValid($paymentgroup);
    }

    /**
     * Get tickets by ids
     */
    private function getTicketsByIds()
    {
        if (!\Input::has('ids') || !is_array(\Input::get('ids'))) {
            return Response::json('missing id list', 400);
        }

        $id_list = array_map('trim', \Input::get('ids'));
        $tickets = [];
        foreach (Ticket::find($id_list) as $ticket) {
            $tickets[$ticket->id] = $ticket;
        }

        foreach ($id_list as $id) {
            if (!isset($tickets[$id])) {
                return Response::json('ticket with id "' . $id . '" not found', 404);
            }

            if (!$tickets[$id]->is_valid) {
                return Response::json('ticket with id "' . $id . '" is not set valid', 404);
            }
        }

        return $tickets;
    }
}
