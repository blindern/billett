<?php

use Carbon\Carbon;

$order_time = Carbon::createFromTimeStamp($order->time)->format('d.m.Y H:i:s');

// ticket list
$tickets_valid = [];
$tickets_revoked = [];
$total = 0;
foreach ($order->tickets as $ticket) {
    if (! $ticket->is_valid) {
        continue;
    }
    if ($ticket->is_revoked) {
        $tickets_revoked[] = $ticket;

        continue;
    }
    $tickets_valid[] = $ticket;
    $total += $ticket->ticketgroup->price + $ticket->ticketgroup->fee;
}

// only add payment info to email if there is only one valid payment and it is a online/web payment
// if any tickets are revoked, we assume the order has been changed and should not contain payment info
$payment = null;
if (count($tickets_revoked) == 0) {
    $payments = $order->payments()->where('amount', '!=', 0)->get();
    if (count($payments) == 1 && $payments[0]->status == 'ACCEPTED') {
        $payment = $payments[0];
    }
}

echo 'Hei,

Takk for at du har kjøpt billetter hos UKA på Blindern. Her er billettene
dine og kjøpskvittering.


BILLETTINFORMASJON:
-------------------
Som vedlegg til denne e-posten ligger det ett PDF-dokument med dine billetter
som hver inneholder en strekkode. Disse billettene skriver du ut og tar med
til arrangementet. Hver billett og tilhørende strekkode kan kun benyttes én
gang.

Billettene bør skrives ut i 100 % størrelse og ikke fylle hele A4-arket.

Billettene kan også fremvises direkte på mobiltelefonen ved inngangen,
og er tilpasset dette formålet.


BEKREFTELSE PÅ KJØP (KVITTERING):
---------------------------------
Navn: '.$order->name.'
E-post: '.$order->email.'
Telefon: '.$order->phone.($order->recruiter ? '
Vervet av: '.$order->recruiter : '').'
';

if ($payment) {
    echo '
Transaksjonsnummer: '.$payment->transaction_id;
}

echo '
Ordrenummer: '.$order->order_text_id.'
Kjøpstidspunkt: '.$order_time.'

Billettspesifikasjon:';

foreach ($tickets_valid as $ticket) {
    $time = Carbon::createFromTimeStamp($ticket->event->time_start)->format('d.m.Y H:i');

    $price = format_nok($ticket->ticketgroup->price + $ticket->ticketgroup->fee);
    if ($ticket->ticketgroup->fee) {
        $price .= ', hvorav '.format_nok($ticket->ticketgroup->fee).' i billettgebyr';
    }

    echo '
  '.$time.': '.$ticket->event->title.': '.$ticket->ticketgroup->title.' ('.$price.') (#'.$ticket->number.')';
}

if (count($tickets_revoked) > 0) {
    echo '

Billetter som er trukket tilbake (til informasjon):';

    foreach ($tickets_revoked as $ticket) {
        $time = Carbon::createFromTimeStamp($ticket->event->time_start)->format('d.m.Y H:i');

        echo '
  '.$time.': '.$ticket->event->title.': '.$ticket->ticketgroup->title.' (#'.$ticket->number.')';
    }
}

echo '


Merverdiavgift: '.format_nok(0).'
Totalbeløp: '.format_nok($total).($payment ? ' har blitt belastet ditt kort' : '').'


SPØRSMÅL/PROBLEMER:
-------------------
Se vår nettside eller ta kontakt:
http://blindernuka.no/
billett@blindernuka.no


Vi håper du får en flott opplevelse på UKA på Blindern!

--
UKA på Blindern
Foreningen Blindern Studenterhjem
http://blindernuka.no/

Dette billettsystemet har vi utviklet som fri programvare og er fritt tilgjengelig,
se https://github.com/blindernuka/billett';
