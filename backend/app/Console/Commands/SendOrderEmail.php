<?php

use Blindern\UKA\Billett\Order;
use Illuminate\Console\Command;

class SendOrderEmail extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'billett:sendorderemail {id}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send the email for a order again.';

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
        $order = Order::findOrFail($this->argument('id'));
        $order->sendEmail();
        echo 'Email should now have been sent to '.$order->email.' ('.$order->name.").\n";
    }
}
