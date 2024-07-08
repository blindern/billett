<?php

return [
    'driver' => 'sendmail',
    'from' => ['address' => 'billett@blindernuka.no', 'name' => 'UKA på Blindern'],
    'sendmail' => '/usr/sbin/sendmail -bs',
];
