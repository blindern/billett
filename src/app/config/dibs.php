<?php

return array(
    'hmac_key' => isset($_ENV['DIBS_HMAC_KEY']) ? $_ENV['DIBS_HMAC_KEY'] : 'overridden-in-local-configuration',
    'merchant_id' => 90053779,
    'capture' => true,
    'checkout_url' => 'https://sat1.dibspayment.com/dibspaymentwindow/entrypoint',
    'test' => true,
    'currency_id' => 578, // NOK
    'language' => 'nb_NO',
    'email_reports' => 'billettsystem-gruppe@blindernuka.no'
);
