<?php

namespace Blindern\UKA\Billett;

use Illuminate\Support\Facades\Cache;

class Printer
{
    const CACHE_NAME = 'printers';

    const TIMEOUT = 65; // announce at least every 65 seconds

    /**
     * Find a printer
     *
     * @param  string  $name
     * @return Printer|null
     */
    public static function find($name)
    {
        $cache = Cache::get(static::CACHE_NAME, []);
        if (! isset($cache[$name])) {
            return null;
        }

        if ($cache[$name]['last_seen'] < time() - static::TIMEOUT) {
            return null;
        }

        $printer = new static($name, $cache[$name]);

        return $printer;
    }

    /**
     * Get list of all printers
     *
     * @return array of Printer
     */
    public static function all()
    {
        $res = [];

        $cache = Cache::get(static::CACHE_NAME, []);
        foreach ($cache as $data) {
            if ($data['last_seen'] < time() - static::TIMEOUT) {
                continue;
            }
            $res[] = new static($data['name'], $data);
        }

        return $res;
    }

    public $name;

    public $data;

    /**
     * @param  string  $name
     */
    public function __construct($name, ?array $data = null)
    {
        $this->name = $name;

        if ($data !== null) {
            $this->data = $data;
        } else {
            $tmp = static::find($name);
            if ($tmp) {
                $this->data = $tmp->data;
            }
        }
    }

    /**
     * Register printer
     *
     * @param  string  $key  A secret that will be sent with the prints
     * @param  array  $ips
     * @param  int  $port
     * @param  string  $originate_ip  The IP of the printer sending the request
     */
    public function register($key, $ips, $port, $originate_ip = null)
    {
        $ip = null;
        if ($this->data && $this->testConnection($this->data['ip'], $port)) {
            $ip = $this->data['ip'];
        } elseif (in_array($originate_ip, $ips) && $this->testConnection($originate_ip, $port)) {
            $ip = $originate_ip;
        } else {
            foreach ($ips as $curip) {
                if ($curip == $originate_ip) {
                    continue;
                }
                if ($this->testConnection($curip, $port)) {
                    $ip = $curip;
                    break;
                }
            }
        }

        $this->data = [
            'name' => $this->name,
            'ips' => $ips,
            'originate_ip' => $originate_ip,
            'ip' => $ip,
            'port' => $port,
            'last_seen' => time(),
            'registered' => $this->data ? $this->data['registered'] : time(),
            'key' => $key,
        ];

        $cache = Cache::get(static::CACHE_NAME, []);
        $cache[$this->name] = $this->data;
        Cache::put(static::CACHE_NAME, $cache, now()->addMinutes(10));
    }

    /**
     * Test connection
     *
     * @param  string  $ip
     * @param  int  $port
     * @return bool success
     */
    private function testConnection($ip, $port)
    {
        return file_get_contents('http://'.$ip.':'.$port) !== false;
    }

    /**
     * Send PDF-document to printer
     *
     * @param  string  $data
     * @return bool
     *
     * @throws \Exception
     */
    public function printPdf($data)
    {
        if (! $this->data || ! $this->data['ip']) {
            throw new \Exception('Printer metadata missing');
        }

        return $this->send($data, 'file.pdf', 'application/pdf');
    }

    /**
     * Send text-document to printer
     *
     * @param  string  $data
     * @return bool
     *
     * @throws \Exception
     */
    public function printText($data)
    {
        if (! $this->data || ! $this->data['ip']) {
            throw new \Exception('Printer metadata missing');
        }

        return $this->send($data, 'file.txt', 'text/plain');
    }

    /**
     * Send document to printer
     */
    private function send($data, $filename, $mime)
    {
        $ch = curl_init('http://'.$this->data['ip'].':'.$this->data['port'].'/print');

        if (! function_exists('curl_file_create')) {
            function curl_file_create($filename, $mimetype = '', $postname = '')
            {
                return "@$filename;filename="
                    .($postname ?: basename($filename))
                    .($mimetype ? ";type=$mimetype" : '');
            }
        }

        $file = $this->storeFile($data);
        $fields = [
            'file' => curl_file_create($file, $mime, $filename),
            'key' => $this->data['key'],
        ];

        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $fields);

        curl_exec($ch);
        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        curl_close($ch);
        unlink($file);

        return substr($status, 0, 1) === '2';
    }

    /**
     * Generate a temp file with data
     *
     * @param  string  $data
     * @return string filename
     */
    private function storeFile($data)
    {
        $filename = tempnam(sys_get_temp_dir(), 'billett_pdf');

        $fh = fopen($filename, 'w');
        fwrite($fh, $data);
        fclose($fh);

        return $filename;
    }
}
