<?php

use Illuminate\Console\Command;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\InputArgument;

class CleanOrders extends Command {

    /**
     * The console command name.
     *
     * @var string
     */
    protected $name = 'billett:clean-orders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Remove expired reservations from orders list';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function fire()
    {
        $res = \Blindern\UKA\Billett\Order::expiredReservations()->get();

        foreach ($res as $order) {
            $order->deleteReservation();
        }

        $this->info('Removed '.count($res).' reservations');
    }

}
