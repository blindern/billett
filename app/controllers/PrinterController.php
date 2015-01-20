<?php

use Blindern\UKA\Billett\Printer;
use Blindern\UKA\Billett\Ticket;

class PrinterController extends Controller
{
    public function __construct()
    {
        $this->beforeFilter('auth', [
            'except' => ['printerAnnounce']
        ]);
    }

    public function index()
    {
        $printers = Printer::all();

        $res = [];
        foreach ($printers as $printer) {
            $res[] = [
                'name' => $printer->data['name'],
                'ip' => $printer->data['ip'],
                'port' => $printer->data['port'],
                'registered' => $printer->data['registered'],
                'last_seen' => $printer->data['last_seen']
            ];
        }

        return $res;
    }

    public function printText($printername) {
        $printer = Printer::find($printername);
        if (!$printer) {
            return \Response::json('unknown printer', 400);
        }

        if (!\Input::has('text')) {
            return \Response::json('missing text', 400);
        }

        if ($printer->printText(\Input::get('text'))) {
            return \Response::json('OK');
        } else {
            return \Response::json('Print failed', 503);
        }
    }

    public function printerAnnounce() {
        $validator = \Validator::make(\Input::all(), [
            'name' => 'required',
            'ips' => 'required',
            'port' => 'required|integer',
            'key' => 'required'
        ]);

        if ($validator->fails()) {
            return \Response::json('data validation failed', 400);
        }

        $printer = new Printer(\Input::get('name'));

        $key = \Input::get('key');
        $ips = \Input::get('ips');
        $port = \Input::get('port');
        $remote_ip = $_SERVER['REMOTE_ADDR'];

        $printer->register($key, $ips, $port, $remote_ip);
        return \Response::json('OK');
    }
}
