<?php

namespace Blindern\UKA\Billett\Helpers;

use Blindern\UKA\Billett\Ticket;
use Illuminate\Support\Facades\View;

/**
 * Helper class for creating a PDF-document for a ticket
 */
class PdfTicket
{
    protected $ticket;

    public function __construct(Ticket $ticket)
    {
        $this->ticket = $ticket;
    }

    /**
     * Generate the actual PDF data for this ticket
     *
     * @return binary
     */
    public function getPdfData()
    {
        $dompdf = new \Dompdf\Dompdf();

        // variable height
        $height = 330;
        if ($this->ticket->ticketgroup->ticket_text != '') {
            $height += 5 + strlen($this->ticket->ticketgroup->ticket_text) / 40 * 10 + 8;
        }
        if ($this->ticket->event->ticket_text != '') {
            $height += 5 + strlen($this->ticket->event->ticket_text) / 40 * 10 + 8;
        }

        // 72 mm width (paper is 80 mm, only 72 mm is printable)
        $dompdf->setPaper([0, 0, 204.09, $height]);

        $dompdf->loadHtml(View::make('ticket')->with('ticket', $this->ticket)->render());

        $dompdf->render();

        return $dompdf->output();
    }
}
