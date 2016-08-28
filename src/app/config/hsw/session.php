<?php

return array(
    //'driver' => 'memcached',
    'driver' => 'file',
    'lifetime' => 120,
    'expire_on_close' => false,
    'cookie' => 'billett_session',
    'path' => '/billett/',
    'domain' => null,
    'secure' => false,
);
