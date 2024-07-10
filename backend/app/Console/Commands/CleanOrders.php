<?php

use Illuminate\Console\Command;

class CleanOrders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'billett:clean-orders';

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
