<?php

$local_url = env('VIPPS_LOCAL_URL');

return [
    'api_base_url' => env('VIPPS_API_BASE_URL', 'https://apitest.vipps.no'),
    'merchant_id' => (int) env('VIPPS_MERCHANT_ID', 240446),
    'test' => (bool) env('VIPPS_TEST', true),
    'client_id' => env('VIPPS_CLIENT_ID', 'overridden-in-local-configuration'),
    'client_secret' => env('VIPPS_CLIENT_SECRET', 'overridden-in-local-configuration'),
    'subscription_key' => env('VIPPS_SUBSCRIPTION_KEY', 'overridden-in-local-configuration'),
    'email_reports' => 'billettsystem-gruppe@blindernuka.no',
    'callback_url' => $local_url ? ($local_url.'/api/vipps/callback') : 'https://billett.blindernuka.no/api/vipps/callback',
    'return_url_template' => $local_url ? ($local_url.'/api/vipps/order-return/{orderId}') : 'https://billett.blindernuka.no/api/vipps/order-return/{orderId}',
];
