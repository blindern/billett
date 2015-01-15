<?php

use \Carbon\Carbon;
$order_time = Carbon::createFromTimeStamp($order->time)->format('d.m.Y H:i:s');

// ticket list
$tickets_valid = [];
$tickets_revoked = [];
$total = 0;
foreach ($order->tickets as $ticket) {
    if (!$ticket->is_valid) continue;
    if ($ticket->is_revoked) {
        $tickets_revoked[] = $ticket;
        continue;
    }
    $tickets_valid[] = $ticket;
    $total += $ticket->ticketgroup->price + $ticket->ticketgroup->fee;
}

$payments = $order->payments()->where('amount', '!=', 0)->get();

echo
'Hei,

Her følger detaljer om din ordre hos UKA på Blindern.'.(count($tickets_valid) > 0 ? ' Dine billetter er vedlagt.


BILLETTINFORMASJON:
-------------------
Som vedlegg til denne e-posten ligger det ett PDF-dokument med dine billetter
som hver inneholder en strekkode. Disse billettene skriver du ut og tar med
til arrangementet. Hver billett og tilhørende strekkode kan kun benyttes én
gang.

Billettene bør skrives ut i 100 % størrelse og ikke fylle hele A4-arket.

Billettene kan også fremvises direkte på mobiltelefonen ved inngangen,
og er tilpasset dette formålet.' : '').'


ORDREDETALJER:
--------------
Navn: '.($order->name ?: 'Ikke registrert').'
E-post: '.($order->email ?: 'Ikke registrert').'
Telefon: '.($order->phone ?: 'Ikke registrert').($order->recruiter ? '
Vervet av: '.$order->recruiter : '').'

Ordrenummer: '.$order->order_text_id.'
Ordretidspunkt: '.$order_time.'


BILLETTSPESIFIKASJON:
---------------------';

if (count($tickets_valid) == 0) {
    echo '
Ordren inneholder ingen gyldige billetter.';
} else {
    foreach ($tickets_valid as $ticket) {
        $time = Carbon::createFromTimeStamp($ticket->event->time_start)->format('d.m.Y H:i');

        $price = format_nok($ticket->ticketgroup->price+$ticket->ticketgroup->fee);
        if ($ticket->ticketgroup->fee) $price .= ', hvorav '.format_nok($ticket->ticketgroup->fee).' i billettgebyr';

        echo '
  '.$time.': '.$ticket->event->title.': '.$ticket->ticketgroup->title.' ('.$price.') (#'.$ticket->number.')';
    }
}

if (count($tickets_revoked) > 0) {
    echo '

Billetter som er trukket tilbake og ikke lenger gyldige (kun til informasjon):';

    foreach ($tickets_revoked as $ticket) {
        $time = Carbon::createFromTimeStamp($ticket->event->time_start)->format('d.m.Y H:i');

        echo '
  '.$time.': '.$ticket->event->title.': '.$ticket->ticketgroup->title.' (#'.$ticket->number.')';
    }
}

echo '

Merverdiavgift: '.format_nok(0).'
Totalbeløp: '.format_nok($total);

if ($order->balance < 0) echo '

' . format_nok(abs($order->balance)) . ' gjenstår å betale.';

elseif ($order->balance > 0) echo '

Du har ' . format_nok(abs($order->balance)) . ' til gode.';

echo '


TRANSAKSJONER REGISTRERT:
-------------------------';

if (count($payments) == 0) {
    echo '
Ingen betalinger er registrert.';
} else {
    foreach ($payments as $payment) {
        $time = Carbon::createFromTimeStamp($payment->time)->format('d.m.Y H:i');

        echo '
'.$time.': '.format_nok($payment->amount).' ('.($payment->is_web ? 'betalt på nett, transaksjonsnr '.$payment->transaction_id : 'manuelt behandlet').')';
    }
}

echo '


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
