<?php

use \Carbon\Carbon;

$start = Carbon::createFromTimeStamp($ticket->event->time_start);
$price = $ticket->ticketgroup->price + $ticket->ticketgroup->fee;

$order_time = Carbon::createFromTimeStamp($ticket->order->time);

$ticketid = "#".$ticket->getNumber();

$format_nok = function($num) {
  return "kr ".number_format($num, 0, ",", " ");
};

$img = \DNS1D::getBarcodePNG($ticket->key, "C128", 2.4, 40);
$logo = public_path() . '/assets/graphics/uka_gul_pikto.gif';
$logo = base64_encode(file_get_contents($logo));

// in development server -TEST is added to orderid
$orderid = $ticket->order->order_text_id;
$is_test = false;
if (substr($orderid, -5) == '-TEST') {
  $orderid = substr($orderid, 0, -5);
  $is_test = true;
}

//$ticket->event->ticket_text = '';
//$ticket->ticketgroup->ticket_text = '';

?>
<!DOCTYPE html>
<html>
  <head>
    <title>
      Billett UKA på Blindern
      <!--
      ".($ticket->event ? ": ".$ticket->event->data['p_title'] : "")
      -->
    </title>
    <!--
    $this->SetAuthor("UKA på Blindern 2013", true);
    -->
    <style type="text/css">
    html, body {
      margin: 0;
      padding: 2mm;

      font-size: 11pt;
      font-family: Helvetica;

      border: 1px solid #000000;
    }

    /** { outline: .3mm dotted #0000FF; }*/

    /*
     * header
     */
    h1 {
      position: fixed;
      top: 8mm;
      left: 30mm;
      text-transform: uppercase;
      font-weight: bold;
      font-size: 21pt;
      border-left: .2mm solid #000;

      margin: 0;
      padding: 1mm 0 1mm 4mm;
    }
    h1 img {
      width: 19mm;
      position: absolute;
      left: -25mm;
      top: -5mm;
    }
    .test {
      position: fixed;
      top: 2mm;
      padding-right: 2mm;
      text-align: right;
      /*font-weight: bold;*/
      color: #FF0000;
    }

    /*
     * footer
     */
    .footer {
      position: fixed;
      width: 100%;
      bottom: 7mm;
      left: 2mm;
      font-size: 90%;
    }
    .footer a {
      text-decoration: none;
    }

    /*
     * page content
     */
    .container {
      margin-top: 23mm;
    }

    /*
     * shared styles
     */
    p {
      margin: 0 0 2mm;
    }
    .type {
      text-transform: uppercase;
      font-weight: bold;
    }
    .value {

    }

    /*
     * section: name
     */
    .name {
      margin-bottom: 2mm;
    }
    .name .type {
      width: 15mm;
    }
    .name .email {
      /*display: block;
      margin-left: 15mm;*/
    }

    /*
     * section: ordernr
     */
    .ordernr {
      font-size: 75%;
      margin-bottom: 2mm;
    }

    /*
     * section: event
     */
    .event {
      margin-bottom: 1mm;
      margin-top: 2mm;
    }
    .event {
      font-size: 90%;
    }
    .event .value {
      display: block;
      margin-left: 10mm;
    }

    /*
     * section: date
     */
    .date {
      font-size: 90%;
    }
    .date .type {
      width: 10mm;
    }

    /*
     * section: ticket-text-event
     */
    .ticket-text-event {
      font-size: 80%;
      color: #FF0000;
      /*margin: 0;*/
    }

    /*
     * section: price
     */

    /*
     * section: ticket-text-ticketgroup
     */
    .ticket-text-ticketgroup {
      font-size: 80%;
      color: #FF0000;
    }

    /*
     * section: barcode
     */
    .barcode {
      text-align: center;
      margin: 5mm 0 0 0;
    }

    .barcode span {
      display: block;
    }

    </style>
  </head>
  <body>
    <h1>
      <img src="data:image/gif;base64,<?php echo $logo; ?>" alt="UKA">
      Billett
    </h1>

    <?php if ($is_test): ?>
      <p class="test">TEST</p>
    <?php endif; ?>

    <div class="container">

      <?php
      if ($ticket->order):
        ?>

        <p class="name">
          <span class="type">Navn:</span>
          <span class="value">
            {{{$ticket->order->name}}}
            <?php if ($ticket->order->email) { ?>
              <span class="email">({{{$ticket->order->email}}})</span>
            <?php } ?>
          </span>
        </p>

        <p class="ordernr">
          <span class="type">Ordrenr:</span>
          <span class="value">
            {{$orderid}}
            ({{$order_time->format('d.m.y')}})
            {{$ticketid}}
          </span>
        </p>

        <?php
      // else if no order
      else:
        ?>

        <p class="name">
          <span class="type">Navn:</span>
          <span class="value_blank"></span>
        </p>

        <p class="ordernr">
          <span class="type">Billettnr:</span>
          <span class="value">
            {{$ticketid}}
          </span>
        </p>

        <?php
      endif;
      ?>

      <p class="event">
        <span class="type">Arrangement:</span>
        <span class="value">
          {{{$ticket->event->title}}}
        </span>
      </p>

      <p class="date">
        <span class="type">Tid:</span>
        <span class="value">
          {{{$start->format('j/n-Y H:i')}}}
        </span>
      </p>

      <?php if ($ticket->event->ticket_text != ""): ?>
        <p class="ticket-text-event">
          {{{$ticket->event->ticket_text}}}
        </p>
      <?php endif; ?>

      <p class="price">
        <span class="type">Pris:</span>
        <span class="value">
          {{$format_nok($price)}} ({{{$ticket->ticketgroup->title}}})
          <?php if ($ticket->ticketgroup->ticket_text != ""): ?>
            *
          <?php endif; ?>
        </span>
        <!--                 $this->Write($h, "(INKL. BILLETTGEBYR)"); -->
      </p>

      <?php if ($ticket->ticketgroup->ticket_text != ""): ?>
        <p class="ticket-text-ticketgroup">
          * {{{$ticket->ticketgroup->ticket_text}}}
        </p>
      <?php endif; ?>

      <p class="barcode">
        <img src="data:image/png;base64,<?php echo $img; ?>" alt="{{{$ticket->key}}}">
        <span>{{{$ticket->key}}}</span>
      </p>

    </div>

    <p class="footer">
      <a href="http://blindernuka.no">blindernuka.no</a>
    </p>

  </body>
</html>
