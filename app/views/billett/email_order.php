<?php

use \Carbon\Carbon;
$order_time = Carbon::createFromTimeStamp($order->time)->format('d.m.Y H:i:s');

$payment = $order->payments()->where('status', 'ACCEPTED')->first();

?>
Hei,

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
Navn: <?=$order->name;?>

E-post: <?=$order->email;?>

Telefon: <?=$order->phone;?>


<?php if ($payment): ?>
Transaksjonsnummer: <?=$payment->transaction_id;?>
<?php endif; ?>

Ordrenummer: <?=$order->order_text_id;?>

Kjøpstidspunkt: <?=$order_time;?>


Billettspesifikasjon:
<?php
$total = 0;
foreach ($order->tickets as $ticket) {
    $total += $ticket->ticketgroup->price + $ticket->ticketgroup->fee;
    $time = Carbon::createFromTimeStamp($ticket->event->time_start)->format('d.m.Y H:i');
    echo
'  '.$time.': '.$ticket->event->title.': '.$ticket->ticketgroup->title.' ('.format_nok($ticket->ticketgroup->price+$ticket->ticketgroup->fee);

    if ($ticket->ticketgroup->fee) echo ', hvorav '.format_nok($ticket->ticketgroup->fee).' i billettgebyr';

    echo ') (#'.$ticket->number.')
';
}
?>

Merverdiavgift: <?=format_nok(0);?>

Totalbeløp: <?=format_nok($total);?> har blitt belastet ditt kort


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
