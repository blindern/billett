<?php namespace Blindern\UKA\Billett\Helpers;

use Blindern\UKA\Billett\Ticket;

/**
 * Helper class for creating a PDF-document for a ticket
 */
class PdfTicket
{
    protected $dompdf;
    protected $ticket;

    public function __construct(Ticket $ticket) {
        $this->ticket = $ticket;
    }

    /**
     * Generate the actual PDF data for this ticket
     *
     * @return binary
     */
    public function getPdfData()
    {
        $this->loadDomPdf();

        $this->dompdf = new \DOMPDF();

        // variable height
        $height = 330;
        if ($this->ticket->ticketgroup->ticket_text != '') $height += 5 + strlen($this->ticket->ticketgroup->ticket_text)/40*10 + 8;
        if ($this->ticket->event->ticket_text != '') $height += 5 + strlen($this->ticket->event->ticket_text)/40*10 + 8;

        // 72 mm width (paper is 80 mm, only 72 mm is printable)
        $this->dompdf->set_paper(array(0, 0, 204.09, $height));

        $this->dompdf->load_html(\View::make('ticket')->with('ticket', $this->ticket)->render());

        $this->dompdf->render();
        return $this->dompdf->output();
    }

    /**
     * Load the PDF-library
     */
    private function loadDomPdf() {
        defined('DOMPDF_ENABLE_AUTOLOAD') or define('DOMPDF_ENABLE_AUTOLOAD', false);
        require_once base_path().'/vendor/dompdf/dompdf/dompdf_config.inc.php';
    }
}

