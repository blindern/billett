<?php

use \Blindern\UKA\Billett\Eventgroup;
use \Blindern\UKA\Billett\Event;
use \Blindern\UKA\Billett\Ticketgroup;

class BillettSeeder extends Seeder {
    public function run()
    {
        $eg = new Eventgroup;
        $eg->title = 'UKA på Blindern 2015';
        $eg->sort_value = '2015-1-uka';
        $eg->save();

        $ev = new Event;
        $ev->eventgroup()->associate($eg);
        $ev->alias = 'revy-1';
        $ev->time_start = time()+86400*13;
        $ev->time_end = time()+84600*13+3600*2;
        $ev->title = "Blindernrevyen";
        $ev->max_sales = 100;
        $ev->is_published = 1;
        $ev->is_selling = 1;
        $ev->save();

        $this->addTicketgroups($ev);

        $ev = new Event;
        $ev->eventgroup()->associate($eg);
        $ev->alias = 'revy-2';
        $ev->time_start = time()+86400*14;
        $ev->time_end = time()+84600*14+3600*2;
        $ev->title = "Blindernrevyen";
        $ev->max_sales = 100;
        $ev->is_published = 1;
        $ev->is_selling = 0;
        $ev->save();

        $this->addTicketgroups($ev);

        $ev = new Event;
        $ev->eventgroup()->associate($eg);
        $ev->alias = 'konsert-1';
        $ev->time_start = time()+86400*15;
        $ev->time_end = time()+84600*15+3600*2;
        $ev->title = "Konsert 1";
        $ev->max_sales = 20;
        $ev->is_published = 1;
        $ev->is_selling = 1;
        $ev->save();

        $this->addTicketgroups($ev);
    }

    public function addTicketgroups(Event $ev)
    {
        $tg = new Ticketgroup;
        $tg->event()->associate($ev);
        $tg->is_active = true;
        $tg->is_published = true;
        $tg->title = "Studentbillett";
        $tg->price = 80;
        $tg->fee = 4;
        $tg->save();

        $tg = new Ticketgroup;
        $tg->event()->associate($ev);
        $tg->is_active = true;
        $tg->is_published = true;
        $tg->title = "Ordinær billett";
        $tg->price = 100;
        $tg->fee = 5;
        $tg->save();

        $tg = new Ticketgroup;
        $tg->event()->associate($ev);
        $tg->is_active = true;
        $tg->is_published = false;
        $tg->title = "Studentbillett (billettluke)";
        $tg->price = 90;
        $tg->fee = 0;
        $tg->save();

        $tg = new Ticketgroup;
        $tg->event()->associate($ev);
        $tg->is_active = true;
        $tg->is_published = false;
        $tg->title = "Ordinær billett (billettluke)";
        $tg->price = 110;
        $tg->fee = 0;
        $tg->save();
    }
}