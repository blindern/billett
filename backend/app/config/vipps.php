<?php

return [
    'api_base_url' => 'https://apitest.vipps.no',
    'merchant_id' => 240446,
    'test' => true,
    'client_id' => isset($_ENV['VIPPS_CLIENT_ID']) ? $_ENV['VIPPS_CLIENT_ID'] : 'overridden-in-local-configuration',
    'client_secret' => isset($_ENV['VIPPS_CLIENT_SECRET']) ? $_ENV['VIPPS_CLIENT_SECRET'] : 'overridden-in-local-configuration',
    'subscription_key' => isset($_ENV['VIPPS_SUBSCRIPTION_KEY']) ? $_ENV['VIPPS_SUBSCRIPTION_KEY'] : 'overridden-in-local-configuration',
    'email_reports' => 'billettsystem-gruppe@blindernuka.no',
    'callback_url' => isset($_ENV['VIPPS_LOCAL_URL']) ? ($_ENV['VIPPS_LOCAL_URL'].'/api/vipps/callback') : 'https://billett.blindernuka.no/api/vipps/callback',
    'return_url_template' => isset($_ENV['VIPPS_LOCAL_URL']) ? ($_ENV['VIPPS_LOCAL_URL'].'/api/vipps/order-return/{orderId}') : 'https://billett.blindernuka.no/api/vipps/order-return/{orderId}',
];
