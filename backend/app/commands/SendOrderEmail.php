<?php

use Blindern\UKA\Billett\Order;
use Illuminate\Console\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputOption;

class SendOrderEmail extends Command
{
    /**
     * The console command name.
     *
     * @var string
     */
    protected $name = 'billett:sendorderemail';

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

    /**
     * Get the console command arguments.
     *
     * @return array
     */
    protected function getArguments()
    {
        return [
            ['id', InputArgument::REQUIRED, 'Order ID'],
        ];
    }

    /**
     * Get the console command options.
     *
     * @return array
     */
    protected function getOptions()
    {
        return [
            //array('example', null, InputOption::VALUE_OPTIONAL, 'An example option.', null),
        ];
    }
}
