<?php

use Blindern\UKA\Billett\Ticket;
use Blindern\UKA\Billett\Paymentgroup;

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
        if (!\Input::has('ids')) {
            return Response::json('missing id list', 400);
        }

        $id_list = array_map('trim', explode(",", \Input::get('ids')));
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

        return Response::make(Ticket::generateTicketsPdf($tickets), 200, array(
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="tickets.pdf"'
        ));
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
}
