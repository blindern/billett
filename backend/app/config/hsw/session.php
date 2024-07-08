<?php

return [
    //'driver' => 'memcached',
    'driver' => 'file',
    'lifetime' => 120,
    'expire_on_close' => false,
    'cookie' => 'billett_session',
    'path' => '/',
    'domain' => null,
    'secure' => false,
];
